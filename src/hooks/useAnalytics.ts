import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchAnalytic {
  id: string;
  search_query: string;
  category?: string;
  location?: string;
  results_count: number;
  created_at: string;
  user_id?: string;
}

export interface ServiceAnalytic {
  id: string;
  service_id: string;
  action_type: string;
  created_at: string;
  user_id?: string;
  service?: {
    title: string;
    category: string;
  };
}

export interface ConversationAnalytic {
  id: string;
  conversation_id: string;
  service_id: string;
  message_count: number;
  started_at: string;
  last_activity_at: string;
  status: string;
  service?: {
    title: string;
    category: string;
  };
}

export interface AnalyticsSummary {
  totalSearches: number;
  totalServiceViews: number;
  totalContacts: number;
  totalConversations: number;
  topSearchTerms: Array<{ query: string; count: number }>;
  topViewedServices: Array<{ service_id: string; title: string; views: number }>;
  topCategories: Array<{ category: string; searches: number; views: number }>;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  console.log('inserting')

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

  console.log(trackSearch);

  // Track service action
  const trackServiceAction = useMutation({
    mutationFn: async ({ 
      serviceId, 
      actionType 
    }: { 
      serviceId: string; 
      actionType: string;
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

export const useAdminAnalytics = () => {
  // Get search analytics
  const getSearchAnalytics = useQuery({
    queryKey: ['admin-search-analytics'],
    queryFn: async (): Promise<SearchAnalytic[]> => {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data || [];
    }
  });

  // Get service analytics
  const getServiceAnalytics = useQuery({
    queryKey: ['admin-service-analytics'],
    queryFn: async (): Promise<ServiceAnalytic[]> => {
      const { data, error } = await supabase
        .from('service_analytics')
        .select(`
          *,
          service:services(title, category)
        `)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        service: Array.isArray(item.service) ? item.service[0] : item.service
      }));
    }
  });

  // Get conversation analytics
  const getConversationAnalytics = useQuery({
    queryKey: ['admin-conversation-analytics'],
    queryFn: async (): Promise<ConversationAnalytic[]> => {
      const { data, error } = await supabase
        .from('conversation_analytics')
        .select(`
          *,
          service:services(title, category)
        `)
        .order('started_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        service: Array.isArray(item.service) ? item.service[0] : item.service
      }));
    }
  });

  // Get analytics summary
  const getAnalyticsSummary = useQuery({
    queryKey: ['admin-analytics-summary'],
    queryFn: async (): Promise<AnalyticsSummary> => {
      try {
        // Get basic counts
        const [searchesResult, viewsResult, contactsResult, conversationsResult] = await Promise.all([
          supabase.from('search_analytics').select('id', { count: 'exact', head: true }),
          supabase.from('service_analytics').select('id', { count: 'exact', head: true }).eq('action_type', 'view'),
          supabase.from('service_analytics').select('id', { count: 'exact', head: true }).neq('action_type', 'view'),
          supabase.from('conversation_analytics').select('id', { count: 'exact', head: true }),
        ]);

        // Get top search terms
        const { data: topSearches } = await supabase
          .rpc('get_top_search_terms');

        // Get top viewed services with proper aggregation
        const { data: topServicesData } = await supabase
          .from('service_analytics')
          .select(`
            service_id,
            service:services(title)
          `)
          .eq('action_type', 'view');

        // Process top services data
        const serviceViewCounts = (topServicesData || []).reduce((acc: any, item: any) => {
          const serviceId = item.service_id;
          const service = Array.isArray(item.service) ? item.service[0] : item.service;
          const title = service?.title || 'خدمة محذوفة';
          if (!acc[serviceId]) {
            acc[serviceId] = { service_id: serviceId, title, views: 0 };
          }
          acc[serviceId].views++;
          return acc;
        }, {});

        const topServices = Object.values(serviceViewCounts)
          .sort((a: any, b: any) => b.views - a.views)
          .slice(0, 10);

        // Get top categories
        const { data: topCategories } = await supabase
          .rpc('get_category_analytics');

        return {
          totalSearches: searchesResult.count || 0,
          totalServiceViews: viewsResult.count || 0,
          totalContacts: contactsResult.count || 0,
          totalConversations: conversationsResult.count || 0,
          topSearchTerms: (topSearches || []).map((item: any) => ({ query: item.query, count: Number(item.count) })),
          topViewedServices: topServices as any[],
          topCategories: (topCategories || []).map((item: any) => ({ 
            category: item.category, 
            searches: Number(item.searches), 
            views: Number(item.views) 
          })),
        };
      } catch (error) {
        console.error('Error fetching analytics summary:', error);
        return {
          totalSearches: 0,
          totalServiceViews: 0,
          totalContacts: 0,
          totalConversations: 0,
          topSearchTerms: [],
          topViewedServices: [],
          topCategories: [],
        };
      }
    }
  });

  const getLoginStats = useQuery({
      queryKey: ['admin-login-stats'],
      queryFn: async () => {
        const { data, error } = await supabase.rpc("login_activity_summary");

        if (error) throw error;

        console.log('Login stats:', data);
        return data;
      }
    })

  return {
    searchAnalytics: getSearchAnalytics.data || [],
    serviceAnalytics: getServiceAnalytics.data || [],
    conversationAnalytics: getConversationAnalytics.data || [],
    analyticsSummary: getAnalyticsSummary.data,
    isLoading: getSearchAnalytics.isLoading || getServiceAnalytics.isLoading || 
               getConversationAnalytics.isLoading || getAnalyticsSummary.isLoading,
    loginStats: getLoginStats.data
  };
};