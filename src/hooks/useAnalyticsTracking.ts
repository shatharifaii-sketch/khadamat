import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalyticsTracking = () => {
  const { user } = useAuth();

  // Track search query
  const trackSearch = useMutation({
    mutationFn: async ({ 
      query, 
      category, 
      location, 
      resultsCount 
    }: { 
      query: string; 
      category?: string; 
      location?: string; 
      resultsCount: number;
    }) => {
      const { error } = await supabase
        .from('search_analytics')
        .insert({
          user_id: user?.id,
          search_query: query,
          category,
          location,
          results_count: resultsCount,
        });

      if (error) throw error;
    }
  });

  // Track service action
  const trackServiceAction = useMutation({
    mutationFn: async ({ 
      serviceId, 
      actionType 
    }: { 
      serviceId: string; 
      actionType: 'view' | 'contact_click' | 'phone_click' | 'email_click';
    }) => {
      const { error } = await supabase
        .from('service_analytics')
        .insert({
          service_id: serviceId,
          user_id: user?.id,
          action_type: actionType,
        });

      if (error) throw error;
    }
  });

  // Track user activity
  const trackUserActivity = useMutation({
    mutationFn: async ({ 
      activityType, 
      details 
    }: { 
      activityType: string; 
      details?: Record<string, any>;
    }) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          details,
        });

      if (error) throw error;
    }
  });

  return {
    trackSearch,
    trackServiceAction,
    trackUserActivity,
  };
};