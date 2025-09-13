
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useServiceViews = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const incrementView = useMutation({
    mutationFn: async (serviceId: string) => {
      // First, get the current views count
      const { data: currentData, error: fetchError } = await supabase
        .from('services')
        .select('title,views')
        .eq('id', serviceId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      console.log('Current views data:', currentData);

      // Then increment the views count
      const newViewsCount = currentData.views + 1;

      console.log(`Incrementing views for service ${serviceId} from ${currentData.views} to ${newViewsCount}`);
      
      const { data, error } = await supabase
        .from('services')
        .update({ views: newViewsCount })
        .eq('id', serviceId)

      if (error) throw error;
      
      // Also record the view in analytics table for accurate tracking
      try {
        await supabase
          .from('service_analytics')
          .insert({
            service_id: serviceId,
            user_id: user?.id,
            action_type: 'view',
            ip_address: null,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null
          });
      } catch (analyticsError) {
        // Don't fail the main operation if analytics fails
        console.warn('Failed to record service view analytics:', analyticsError);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-services'] });
      queryClient.invalidateQueries({ queryKey: ['public-services'] });
    }
  });

  return {
    incrementView: incrementView.mutate,
    isIncrementing: incrementView.isPending
  };
};
