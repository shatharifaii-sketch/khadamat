import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

type MediaType = "image" | "video";

interface UploadedMedia {
  id: string;
  url: string;
  name: string;
  type: MediaType;
  file?: File;
  thumbnail?: string;
}

export async function generateVideoThumbnail(
  file: File,
  seekTo = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    video.preload = "metadata";
    video.muted = true;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(seekTo, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not create canvas"));
        return;
      }

      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src);

        if (!blob) {
          reject(new Error("Could not create thumbnail blob"));
          return;
        }

        resolve(blob);
      }, "image/jpeg", 0.85);
    };

    video.onerror = reject;
  })
}

export const useImageUpload = () => {
  const { user } = useAuth();
  const { t } = useTranslation("responses");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const [deletingImage, setDeletingImage] = useState<boolean>(false);

  const validateFile = (file: File, type: MediaType): boolean => {
    if (type === "image") {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) return false;
      if (file.size > 10 * 1024 * 1024) return false;
    }

    if (type === "video") {
      if (!file.type.match(/^video\/(mp4|webm|quicktime)$/)) return false;
      if (file.size > 100 * 1024 * 1024) return false; // example 100MB
    }

    return true;
  };

  const uploadImage = async (file: File, type: MediaType): Promise<UploadedMedia | null> => {
    if (!user) {
      toast.error(t("unauthorized") || 'يجب تسجيل الدخول أولاً');
      return null;
    }

    if (!validateFile(file, type)) return null;

    try {
      const bucket = type === "image" ? "service-images" : "service-videos";

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      const thumbnailPath = type === "video" ? `${user.id}/thumbnails/${Date.now()}.jpg` : null;
      let thumbnailURL: string | null = null;

      if (type === "video") {
        console.log('Generating thumbnail for video:', type);
        const thumbnailBlob = await generateVideoThumbnail(file);

        const thumbnailFile = new File(
          [thumbnailBlob],
          `${crypto.randomUUID()}.jpg`,
          {
            type: "image/jpeg",
          }
        )

        console.log('Uploading thumbnail to path:', thumbnailPath);

        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from("video-thumbnails")
          .upload(thumbnailPath, thumbnailFile);

        console.log('Thumbnail upload response:', { thumbnailData, thumbnailError });

        if (thumbnailError) {
          console.error('Thumbnail upload error:', thumbnailError);
          toast.error(t("thumbnail_upload_failed") || 'فشل في رفع الصورة المصغرة للفيديو');
        }
      }

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(t("file_upload_failed") || 'فشل في رفع الملف، يرجى المحاولة لاحقاً');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (type === "video") {
        const { data: { publicUrl: thumbnailPublicUrl } } = supabase.storage
          .from("video-thumbnails")
          .getPublicUrl(thumbnailPath);
        
        thumbnailURL = thumbnailPublicUrl;
      }

      return {
        id: fileName,
        url: publicUrl,
        name: file.name,
        thumbnail: type === "video" ? thumbnailURL || "" : undefined,
        type,
        file
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t("file_upload_failed") || 'فشل في رفع الملف، يرجى المحاولة لاحقاً');
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (media.length + files.length > 6) {
      toast.error(t("max_images_limit") || 'يمكنك رفع 6 صور كحد أقصى');
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
          toast.error(t("invalid_image_type") || 'نوع الملف غير مدعوم. الرجاء رفع ملف بصيغة JPEG أو PNG أو MP4 أو WEBM');
          return null;
        }

        const type = isImage ? "image" : "video";

        return await uploadImage(file, type);
      });

      const uploadedMedia = await Promise.allSettled(uploadPromises);

      const successful: UploadedMedia[] = [];

      uploadedMedia.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          successful.push(result.value);
        }
      });

      setMedia(prev => [...prev, ...successful]);

      if (successful.length > 0) {
        toast.success(t("file_upload_success", { count: successful.length }) || `تم رفع ${successful.length} ملف بنجاح`);
      }
    } catch (error) {
      console.error('Error handling file select:', error);
      toast.error(t("file_upload_failed") || 'فشل في رفع الملف، يرجى المحاولة لاحقاً');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (id: string, type: string, thumbnail?: string) => {
    try {
      setDeletingImage((prev) => prev || true);
      const bucket = type === "image" ? "service-images" : "service-videos";

      // Remove from storage
      const { error } = await supabase.storage
        .from(bucket)
        .remove([id]);

      if (type === "video") {
        const { error: thumbnailError } = await supabase.storage
          .from("service-thumbnails")
          .remove(thumbnail ? [thumbnail] : []);

        if (thumbnailError) {
          console.error('Error removing file:', error);
          toast.error(t("file_delete_failed") || 'مشكلة في حذف الملف');
          return;
        }
      }

      if (error) {
        console.error('Error removing file:', error);
        toast.error(t("file_delete_failed") || 'مشكلة في حذف الملف');
        return;
      } else {
        // Remove from state
        setMedia(prev => prev.filter(i => i.id !== id));
      }

      setDeletingImage(false);
      toast.success(t("file_delete_success") || 'تم حذف الملف');
    } catch (error) {
      setDeletingImage(false);
      console.error('Error removing file:', error);
      toast.error(t("file_delete_failed") || 'فشل في حذف الملف');
    }
  };

  const clearImages = async () => {
    if (media.length === 0) return;

    try {
      const imageIds = media.map(img => img.id);
      const { error } = await supabase.storage
        .from('service-images')
        .remove(imageIds);

      const videoIds = media.map(img => img.id);
      const { error: videoError } = await supabase.storage
        .from('service-videos')
        .remove(videoIds);

      const { error: thumbnailError } = await supabase.storage
        .from('service-thumbnails')
        .remove(media.map(img => img.thumbnail));

      if (error) {
        console.error('Error clearing files:', error);
        toast.error(t("file_clear_failed") || 'فشل في مسح الملفات');
      }

      setMedia([]);
    } catch (error) {
      console.error('Error clearing files:', error);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string, type?: string, thumbnail?: string) => {
    const url = new URL(imageUrl);
    const parts = url.pathname.split('/');
    const bucketIndex = parts.indexOf("public") + 1;
    const bucket = parts[bucketIndex];
    const filePath = parts.slice(bucketIndex + 1).join("/");

    try {
      setDeletingImage((prev) => prev || true);

      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        return;
      }

      if (type === "video" && thumbnail) {
        const { error: thumbnailError } = await supabase.storage
          .from('service-thumbnails')
          .remove([thumbnail]);

        if (thumbnailError) {
          console.error('Error deleting file from storage:', thumbnailError);
          return;
        }
      }

      const { error: dbError } = await supabase.from('service_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('Error deleting file from DB:', dbError);
        return;
      }

      console.log('File deleted successfully');


      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
      queryClient.invalidateQueries({ queryKey: ['service-images'] });
      queryClient.invalidateQueries({ queryKey: ['service-edit-data'] });
      setDeletingImage(false);
    } catch (error) {
      setDeletingImage(false);
      console.error('Error deleting file:', error);
    }
  }

  return {
    media,
    uploading,
    handleFileSelect,
    removeImage,
    clearImages,
    setMedia,
    deleteImage,
    deletingImage
  };
};