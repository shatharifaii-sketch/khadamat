import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface UploadedImage {
    id: string;
    url: string;
    name: string;
    file?: File;
}

interface SaveImageProps {
    url: string;
    userId: string;
}

export const useProfileImageUpload = () => {
    const { user } = useAuth();
    const { t } = useTranslation("responses");
    const [image, setImage] = useState<UploadedImage | null>(null);
    const [uploading, setUploading] = useState(false);

    const validateFile = (file: File): boolean => {
        // Check file type
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
            toast.error(t("invalid_image_type") || 'نوع الملف غير مدعوم. الرجاء رفع صورة بصيغة JPEG أو PNG');
            return false;
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            toast.error(t("image_too_large") || 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
            return false;
        }

        return true;
    };

    const uploadImage = async (file: File): Promise<UploadedImage | null> => {
        if (!user) {
            toast.error(t("unauthorized") || 'يجب تسجيل الدخول أولاً');
            return null;
        }

        if (!validateFile(file)) return null;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('profiles-images')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error(t("image_upload_failed") || 'فشل في رفع الصورة، يرجى المحاولة لاحقاً');
                return null;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('profiles-images')
                .getPublicUrl(fileName);

            return {
                id: fileName,
                url: publicUrl,
                name: file.name,
                file
            };
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error(t("image_upload_failed") || 'فشل في رفع الصورة، يرجى المحاولة لاحقاً');
            return null;
        }
    };

    const handleFileSelect = async (files: FileList | File[]) => {
        setUploading(true);

        try {
            const file = Array.isArray(files) ? files[0] : files.item(0);

            if (!file) {
                toast.error(t("no_file_selected") || 'لم يتم اختيار صورة');
                return;
            }

            const uploadedImage = await uploadImage(file);

            if (uploadedImage) {
                setImage(uploadedImage);
                toast.success(t("image_upload_success") || 'تم رفع الصورة بنجاح');
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
            // Remove from storage
            const { error } = await supabase.storage
                .from('profiles-images')
                .remove([imageId]);

            if (error) {
                console.error('Error removing image:', error);
                toast.error(t("image_delete_failed") || 'فشل في حذف الصورة');
                return;
            }

            // Remove from state
            setImage(null);
            toast.success(t("image_delete_success") || 'تم حذف الصورة');
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error(t("image_delete_failed") || 'فشل في حذف الصورة');
        }
    };

    return {
        image,
        uploading,
        handleFileSelect,
        removeImage,
        setImage
    };
};

export const useSaveProfileImage = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    
    return useMutation({
        mutationKey: ['update-profile-image'],
        mutationFn: async ({ url, userId }: SaveImageProps) => {
            const { data, error } = await supabase
                .from('profiles')
                .update({ profile_image_url: url })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success(t("image_saved_successfully"));
        },
        onError: () => {
            toast.error(t("image_save_failed"));
        }
    });
}