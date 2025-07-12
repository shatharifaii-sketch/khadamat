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
  action_type: 'view' | 'contact_click' | 'phone_click' | 'email_click';
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
      return (data || []) as ServiceAnalytic[];
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
      return data || [];
    }
  });

  // Get analytics summary
  const getAnalyticsSummary = useQuery({
    queryKey: ['admin-analytics-summary'],
    queryFn: async (): Promise<AnalyticsSummary> => {
      // Get basic counts
      const [searchesResult, viewsResult, contactsResult, conversationsResult] = await Promise.all([
        supabase.from('search_analytics').select('id', { count: 'exact', head: true }),
        supabase.from('service_analytics').select('id', { count: 'exact', head: true }).eq('action_type', 'view'),
        supabase.from('service_analytics').select('id', { count: 'exact', head: true }).neq('action_type', 'view'),
        supabase.from('conversation_analytics').select('id', { count: 'exact', head: true }),
      ]);

      // Get top search terms - manual aggregation
      const { data: searchData } = await supabase
        .from('search_analytics')
        .select('search_query')
        .limit(1000);

      const searchTermCounts = (searchData || []).reduce((acc: Record<string, number>, item) => {
        acc[item.search_query] = (acc[item.search_query] || 0) + 1;
        return acc;
      }, {});

      const topSearchTerms = Object.entries(searchTermCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      // Get top viewed services with manual aggregation
      const { data: serviceViewsData } = await supabase
        .from('service_analytics')
        .select(`
          service_id,
          service:services(title)
        `)
        .eq('action_type', 'view')
        .limit(1000);

      const serviceViewCounts = (serviceViewsData || []).reduce((acc: Record<string, { title: string; views: number }>, item: any) => {
        const serviceId = item.service_id;
        const title = item.service?.title || 'Unknown';
        if (!acc[serviceId]) {
          acc[serviceId] = { title, views: 0 };
        }
        acc[serviceId].views += 1;
        return acc;
      }, {});

      const topViewedServices = Object.entries(serviceViewCounts)
        .sort(([,a], [,b]) => b.views - a.views)
        .slice(0, 10)
        .map(([service_id, { title, views }]) => ({ service_id, title, views }));

      // Get category analytics - manual aggregation
      const { data: searchCategories } = await supabase
        .from('search_analytics')
        .select('category')
        .not('category', 'is', null);

      const { data: serviceCategories } = await supabase
        .from('service_analytics')
        .select('service:services(category)')
        .eq('action_type', 'view');

      const categoryStats = {} as Record<string, { searches: number; views: number }>;

      (searchCategories || []).forEach(item => {
        if (item.category) {
          if (!categoryStats[item.category]) {
            categoryStats[item.category] = { searches: 0, views: 0 };
          }
          categoryStats[item.category].searches += 1;
        }
      });

      (serviceCategories || []).forEach((item: any) => {
        const category = item.service?.category;
        if (category) {
          if (!categoryStats[category]) {
            categoryStats[category] = { searches: 0, views: 0 };
          }
          categoryStats[category].views += 1;
        }
      });

      const topCategories = Object.entries(categoryStats)
        .sort(([,a], [,b]) => (b.searches + b.views) - (a.searches + a.views))
        .slice(0, 10)
        .map(([category, stats]) => ({ category, ...stats }));

      return {
        totalSearches: searchesResult.count || 0,
        totalServiceViews: viewsResult.count || 0,
        totalContacts: contactsResult.count || 0,
        totalConversations: conversationsResult.count || 0,
        topSearchTerms,
        topViewedServices,
        topCategories,
      };
    }
  });

  return {
    searchAnalytics: getSearchAnalytics.data || [],
    serviceAnalytics: getServiceAnalytics.data || [],
    conversationAnalytics: getConversationAnalytics.data || [],
    analyticsSummary: getAnalyticsSummary.data,
    isLoading: getSearchAnalytics.isLoading || getServiceAnalytics.isLoading || 
               getConversationAnalytics.isLoading || getAnalyticsSummary.isLoading,
  };
};