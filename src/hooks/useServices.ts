
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Service {
  id?: string;
  title: string;
  category: string;
  description: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience?: string;
  status?: string;
  user_id?: string;
}

export const useServices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createService = useMutation({
    mutationFn: async (serviceData: Service) => {
      if (!user) throw new Error('User must be authenticated');
      
      console.log('Creating service for user:', user.id);
      
      // First, ensure the user has a profile
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating profile for user:', user.id);
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            is_service_provider: true
          });
        
        if (profileCreateError) {
          console.error('Error creating profile:', profileCreateError);
          throw new Error('Failed to create user profile');
        }
      } else if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
        throw profileCheckError;
      }

      // Now create the service
      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          user_id: user.id,
          status: 'published'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        throw error;
      }
      
      console.log('Service created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['user-services'] });
      queryClient.invalidateQueries({ queryKey: ['public-services'] });
      toast.success('تم نشر الخدمة بنجاح!');
    },
    onError: (error: any) => {
      console.error('Error creating service:', error);
      toast.error('حدث خطأ في نشر الخدمة: ' + error.message);
    }
  });

  const getUserServices = useQuery({
    queryKey: ['user-services', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching user services for:', user.id);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user services:', error);
        throw error;
      }
      
      console.log('User services fetched:', data);
      return data;
    },
    enabled: !!user
  });

  return {
    createService,
    getUserServices,
    isCreating: createService.isPending
  };
};
