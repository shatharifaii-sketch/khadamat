import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  file?: File;
}

export const useImageUpload = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('يرجى اختيار صور بصيغة PNG أو JPG فقط');
      return false;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
      return false;
    }

    return true;
  };

  const uploadImage = async (file: File): Promise<UploadedImage | null> => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return null;
    }

    if (!validateFile(file)) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('فشل في رفع الصورة');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(fileName);

      return {
        id: fileName,
        url: publicUrl,
        name: file.name,
        file
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('حدث خطأ في رفع الصورة');
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | File[]) => {
    if (images.length + files.length > 6) {
      toast.error('يمكنك رفع 6 صور كحد أقصى');
      return;
    }

    setUploading(true);
    const fileArray = Array.from(files);
    
    try {
      const uploadPromises = fileArray.map(file => uploadImage(file));
      const uploadedImages = await Promise.all(uploadPromises);
      
      const validImages = uploadedImages.filter(img => img !== null) as UploadedImage[];
      setImages(prev => [...prev, ...validImages]);
      
      if (validImages.length > 0) {
        toast.success(`تم رفع ${validImages.length} صورة بنجاح`);
      }
    } catch (error) {
      console.error('Error handling file select:', error);
      toast.error('حدث خطأ في رفع الصور');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      // Remove from storage
      const { error } = await supabase.storage
        .from('service-images')
        .remove([imageId]);

      if (error) {
        console.error('Error removing image:', error);
        toast.error('فشل في حذف الصورة');
        return;
      }

      // Remove from state
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('تم حذف الصورة');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('حدث خطأ في حذف الصورة');
    }
  };

  const clearImages = async () => {
    if (images.length === 0) return;

    try {
      const imageIds = images.map(img => img.id);
      const { error } = await supabase.storage
        .from('service-images')
        .remove(imageIds);

      if (error) {
        console.error('Error clearing images:', error);
      }

      setImages([]);
    } catch (error) {
      console.error('Error clearing images:', error);
    }
  };

  return {
    images,
    uploading,
    handleFileSelect,
    removeImage,
    clearImages,
    setImages
  };
};