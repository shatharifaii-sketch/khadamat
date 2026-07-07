
import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  experience_years?: number;
  profile_image_url?: string;
  is_service_provider?: boolean;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation("responses");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const getProfile = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const updateProfile = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(t("profile_updated_successfully"));
    },
    onError: (error: unknown) => {
      console.error('Error updating profile:', error);
      toast.error(t("profile_update_failed"));
    }
  });

  const {
    mutateAsync: deleteProfile,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError
  } = useMutation({
    mutationKey: ['delete-profile'],
    mutationFn: async () => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase.functions.invoke('delete-user-profile', {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id })
      });

      if (error) {
        throw new Error(t(error.message));
      }

      if (!data.success && data.error) {
        throw new Error(t(data.error));
      }

      await supabase.auth.signOut();

      return navigate('/', { replace: true });
    },
    onError: (error: unknown) => {
      console.error('Error deleting profile:', error);
      toast.error(t("profile_delete_failed"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(t("profile_deleted_successfully"));
    }
  })

  const confirmEmail = useMutation({
    mutationFn: async ({ otp, email, user_id }: { otp: string; email: string; user_id: string; }) => {
      if (!user) throw new Error('User must be authenticated');

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email_change'
      });

      if (error) {
        toast.error(error.code === "otp_expired" ? t("otp_expired") : t("unknown_validation_error"));
        console.error('Error verifying OTP:', error);
        return { error };
      }

      toast.success('تم التحقق من البريد الألكتروني');

      const response = await supabase.functions.invoke('confirm-new-email', { body: JSON.stringify({ email, user_id }) });

      if (!response.data.success) {
        toast.error(t("unknown_validation_error"));
        console.error('Error verifying OTP:', response.data.error);
        return { error: response.data.error };
      }

      return 'OTP verified successfully';
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      window.location.reload();
    },
    onError: (error: unknown) => {
      console.error('Error updating profile:', error);
      toast.error('حدث خطأ في تحديث الملف الشخصي');
    }
  });

  const changePassword = useMutation({
    mutationFn: async (password: string) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        console.error('Error changing password:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(t("password_updated_successfully"));

      navigate('/', { replace: true });
    }
  });

  return {
    profile: getProfile.data,
    updateProfile,
    isLoading: getProfile.isLoading,
    isUpdating: updateProfile.isPending,
    confirmEmail,
    changePassword,
    deleteProfile,
    isDeleting,
    isDeleteError,
    deleteError
  };
};

export const usePublisherProfile = (userId: string) => {
  const { data: getProfile } = useSuspenseQuery({
    queryKey: ['publisher-profile', userId],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from('profiles_with_email')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return profile;
    }
  });

  const { data: getServices } = useSuspenseQuery({
    queryKey: ['publisher-services', getProfile.id],
    queryFn: async () => {
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', getProfile.id);

      if (error) throw error;
      return services;
    }
  })

  return { profile: getProfile, services: getServices };
}