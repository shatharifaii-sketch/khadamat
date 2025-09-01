import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    const [image, setImage] = useState<UploadedImage | null>(null);
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
                .from('profiles-images')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error('فشل في رفع الصورة');
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
            toast.error('حدث خطأ في رفع الصورة');
            return null;
        }
    };

    const handleFileSelect = async (files: FileList | File[]) => {
        setUploading(true);

        try {
            const file = Array.isArray(files) ? files[0] : files.item(0);

            if (!file) {
                toast.error('لم يتم اختيار أي ملف');
                return;
            }

            const uploadedImage = await uploadImage(file);

            if (uploadedImage) {
                setImage(uploadedImage);
                toast.success('تم رفع الصورة بنجاح');
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
                .from('profiles-images')
                .remove([imageId]);

            if (error) {
                console.error('Error removing image:', error);
                toast.error('فشل في حذف الصورة');
                return;
            }

            // Remove from state
            setImage(null);
            toast.success('تم حذف الصورة');
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('حدث خطأ في حذف الصورة');
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
            toast.success('تم حفظ الصورة بنجاح');
        },
        onError: () => {
            toast.error('حدث خطاء في حفظ الصورة');
        }
    });
}