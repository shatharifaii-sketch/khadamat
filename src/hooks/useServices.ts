
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
      
      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          user_id: user.id,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('تم نشر الخدمة بنجاح!');
    },
    onError: (error: any) => {
      console.error('Error creating service:', error);
      toast.error('حدث خطأ في نشر الخدمة');
    }
  });

  const getUserServices = useQuery({
    queryKey: ['user-services', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
