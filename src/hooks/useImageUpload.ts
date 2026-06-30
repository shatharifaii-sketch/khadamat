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

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(t("image_upload_failed") || 'فشل في رفع الصورة، يرجى المحاولة لاحقاً');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        id: fileName,
        url: publicUrl,
        name: file.name,
        type,
        file
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t("image_upload_failed") || 'فشل في رفع الصورة، يرجى المحاولة لاحقاً');
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
        toast.success(t("image_upload_success", { count: successful.length }) || `تم رفع ${successful.length} ملف بنجاح`);
      }
    } catch (error) {
      console.error('Error handling file select:', error);
      toast.error(t("image_upload_failed") || 'فشل في رفع الصورة، يرجى المحاولة لاحقاً');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      setDeletingImage((prev) => prev || true);

      // Remove from storage
      const { error } = await supabase.storage
        .from('service-images')
        .remove([imageId]);

      if (error) {
        console.error('Error removing image:', error);
        toast.error(t("image_delete_failed") || 'فشل في حذف الصورة');
        return;
      }

      // Remove from state
      setMedia(prev => prev.filter(img => img.id !== imageId));
      setDeletingImage(false);
      toast.success(t("image_delete_success") || 'تم حذف الصورة');
    } catch (error) {
      setDeletingImage(false);
      console.error('Error removing image:', error);
      toast.error(t("image_delete_failed") || 'فشل في حذف الصورة');
    }
  };

  const clearImages = async () => {
    if (media.length === 0) return;

    try {
      const imageIds = media.map(img => img.id);
      const { error } = await supabase.storage
        .from('service-images')
        .remove(imageIds);

      if (error) {
        console.error('Error clearing images:', error);
      }

      setMedia([]);
    } catch (error) {
      console.error('Error clearing images:', error);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
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
        console.error('Error deleting image from storage:', storageError);
        return;
      }

      const { error: dbError } = await supabase.from('service_images')
        .delete()
        .eq('id', imageId);


      if (dbError) {
        console.error('Error deleting image from DB:', dbError);
        return;
      }

      console.log('Image deleted successfully');


      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
      queryClient.invalidateQueries({ queryKey: ['service-images'] });
      queryClient.invalidateQueries({ queryKey: ['service-edit-data'] });
      setDeletingImage(false);
    } catch (error) {
      setDeletingImage(false);
      console.error('Error deleting image:', error);
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