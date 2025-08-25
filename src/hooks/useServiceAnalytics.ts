import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceAnalyticsData {
  totalViews: number;
  totalContacts: number;
  totalEmailClicks: number;
  totalPhoneClicks: number;
  recentViews: Array<{
    created_at: string;
    user_id?: string;
  }>;
}

export const useServiceAnalytics = (serviceId: string) => {
  return useQuery({
    queryKey: ['service-analytics', serviceId],
    queryFn: async (): Promise<ServiceAnalyticsData> => {
      const { data, error } = await supabase
        .from('service_analytics')
        .select('action_type, created_at, user_id')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const analytics = data || [];
      
      const totalViews = analytics.filter(item => item.action_type === 'view').length;
      const totalEmailClicks = analytics.filter(item => item.action_type === 'email_click').length;
      const totalPhoneClicks = analytics.filter(item => item.action_type === 'phone_click').length;
      const totalContactClicks = analytics.filter(item => item.action_type === 'contact_click').length;
      const totalContacts = totalEmailClicks + totalPhoneClicks + totalContactClicks;
      
      const recentViews = analytics
        .filter(item => item.action_type === 'view')
        .slice(0, 10)
        .map(item => ({
          created_at: item.created_at,
          user_id: item.user_id
        }));
      
      return {
        totalViews,
        totalContacts,
        totalEmailClicks,
        totalPhoneClicks,
        recentViews
      };
    },
    enabled: !!serviceId
  });
};

export const useUserServiceAnalytics = (userId: string) => {
  return useQuery({
    queryKey: ['user-service-analytics', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_analytics')
        .select(`
          service_id,
          action_type,
          created_at,
          service:services(title, category)
        `)
        .eq('services.user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by service
      const serviceStats = (data || []).reduce((acc: any, item: any) => {
        const serviceId = item.service_id;
        if (!acc[serviceId]) {
          acc[serviceId] = {
            serviceId,
            title: item.service?.title || 'خدمة محذوفة',
            category: item.service?.category || '',
            views: 0,
            contacts: 0,
            emailClicks: 0,
            phoneClicks: 0
          };
        }
        
        switch (item.action_type) {
          case 'view':
            acc[serviceId].views++;
            break;
          case 'email_click':
            acc[serviceId].emailClicks++;
            acc[serviceId].contacts++;
            break;
          case 'phone_click':
            acc[serviceId].phoneClicks++;
            acc[serviceId].contacts++;
            break;
          case 'contact_click':
            acc[serviceId].contacts++;
            break;
        }
        
        return acc;
      }, {});
      
      return Object.values(serviceStats);
    },
    enabled: !!userId
  });
};