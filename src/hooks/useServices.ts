
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
      if (!user) {
        console.error('No user found when trying to create service');
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      console.log('Creating service for user:', user.id);
      console.log('Service data:', serviceData);
      
      // Check user's service quota before creating
      console.log('Checking service quota...');
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('services_allowed, services_used')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError) {
        console.error('Error checking subscription:', subError);
        throw new Error('خطأ في التحقق من الاشتراك: ' + subError.message);
      }

      console.log('Subscription data:', subscription);

      // If no subscription exists or quota exceeded, throw error
      if (!subscription || subscription.services_used >= subscription.services_allowed) {
        const message = !subscription 
          ? 'لا يوجد اشتراك نشط. يرجى الدفع لنشر الخدمات.'
          : 'لقد استنفدت حصتك من الخدمات. يرجى الدفع لنشر المزيد من الخدمات.';
        throw new Error(message);
      }
      
      // First, ensure the user has a profile
      console.log('Checking user profile...');
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, is_service_provider')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
        throw new Error('خطأ في التحقق من الملف الشخصي: ' + profileCheckError.message);
      }

      if (!existingProfile) {
        // Profile doesn't exist, create it as a service provider
        console.log('Creating profile for user:', user.id);
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            is_service_provider: true
          });
        
        if (profileCreateError) {
          console.error('Error creating profile:', profileCreateError);
          throw new Error('فشل في إنشاء الملف الشخصي: ' + profileCreateError.message);
        }
      } else if (!existingProfile.is_service_provider) {
        // Profile exists but is not marked as service provider, update it
        console.log('Updating profile to mark as service provider:', user.id);
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ is_service_provider: true })
          .eq('id', user.id);
        
        if (profileUpdateError) {
          console.error('Error updating profile:', profileUpdateError);
          throw new Error('فشل في تحديث الملف الشخصي: ' + profileUpdateError.message);
        }
      }

      // Now create the service
      console.log('Creating service...');
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
        throw new Error('فشل في إنشاء الخدمة: ' + error.message);
      }
      
      // Update services_used count
      console.log('Updating services_used count...');
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          services_used: subscription.services_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating services_used:', updateError);
        // Don't throw error here as service was created successfully
        console.warn('Service created but quota count update failed');
      }
      
      console.log('Service created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['user-services'] });
      queryClient.invalidateQueries({ queryKey: ['public-services'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
      toast.success('تم نشر الخدمة بنجاح!');
    },
    onError: (error: any) => {
      console.error('Error creating service:', error);
      toast.error(error.message || 'حدث خطأ في نشر الخدمة');
    }
  });

  const getUserServices = useQuery({
    queryKey: ['user-services', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user for getUserServices');
        return [];
      }
      
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
      
      console.log('User services fetched:', data?.length, 'services');
      return data || [];
    },
    enabled: !!user
  });

  return {
    createService,
    getUserServices,
    isCreating: createService.isPending
  };
};
