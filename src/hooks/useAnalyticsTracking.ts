
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
          ip_address: null, // Could be filled by edge function
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error tracking search:', error);
        throw error;
      }
    }
  });

  // Track service action (view, contact click, phone click, email click)
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
          ip_address: null, // Could be filled by edge function
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });

      if (error) {
        console.error('Error tracking service action:', error);
        throw error;
      }
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
          ip_address: null, // Could be filled by edge function
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error tracking user activity:', error);
        throw error;
      }
    }
  });

  // Track page visit
  const trackPageVisit = useMutation({
    mutationFn: async ({ 
      page, 
      referrer 
    }: { 
      page: string; 
      referrer?: string;
    }) => {
      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: user?.id,
          activity_type: 'page_visit',
          details: { 
            page, 
            referrer: referrer || document.referrer,
            timestamp: new Date().toISOString()
          },
          ip_address: null,
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error tracking page visit:', error);
        throw error;
      }
    }
  });

  return {
    trackSearch,
    trackServiceAction,
    trackUserActivity,
    trackPageVisit,
  };
};
