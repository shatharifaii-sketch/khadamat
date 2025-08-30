
import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();

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
      toast.success('تم تحديث الملف الشخصي بنجاح!');
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      toast.error('حدث خطأ في تحديث الملف الشخصي');
    }
  });

  return {
    profile: getProfile.data,
    updateProfile,
    isLoading: getProfile.isLoading,
    isUpdating: updateProfile.isPending
  };
};

export const usePublisherProfile = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: getProfile } = useSuspenseQuery({
    queryKey: ['publisher-profile'],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from('profiles_with_email')
        .select('*')
        .eq('id', userId)
        .single();
      
        console.log('Publisher profile:', profile);

      if (error) throw error;
      return profile;
    }
  });

  if (!getProfile) return { profile: null, services: null };

  const { data: getServices } = useSuspenseQuery({
    queryKey: ['publisher-services'],
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