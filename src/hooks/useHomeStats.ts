
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HomeStats {
  serviceProvidersCount: number;
  publishedServicesCount: number;
  categoriesWithServices: Array<{
    category: string;
    count: number;
  }>;
}

export const useHomeStats = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for stats updates
  useEffect(() => {
    console.log('Setting up real-time subscription for home stats...');
    
    const channel = supabase
      .channel('home-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'services'
        },
        (payload) => {
          console.log('Real-time service change detected for stats:', payload);
          
          // Invalidate and refetch the stats data
          queryClient.invalidateQueries({ queryKey: ['home-stats'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription for home stats');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['home-stats'],
    queryFn: async (): Promise<HomeStats> => {
      console.log('Fetching home statistics...');
      
      // Get count of service providers by counting distinct users with published services
      const { data: serviceProviders, error: providersError } = await supabase
        .from('services')
        .select('user_id')
        .eq('status', 'published');

      if (providersError) {
        console.error('Error fetching service providers count:', providersError);
      }

      // Count unique service providers
      const uniqueProviders = new Set(serviceProviders?.map(s => s.user_id) || []);
      const serviceProvidersCount = uniqueProviders.size;

      // Get count of published services
      const { count: publishedServicesCount, error: servicesError } = await supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');

      if (servicesError) {
        console.error('Error fetching published services count:', servicesError);
      }

      // Get services grouped by category
      const { data: servicesByCategory, error: categoryError } = await supabase
        .from('services')
        .select('category')
        .eq('status', 'published');

      if (categoryError) {
        console.error('Error fetching services by category:', categoryError);
      }

      // Count services by category
      const categoryCounts: Record<string, number> = {};
      servicesByCategory?.forEach(service => {
        categoryCounts[service.category] = (categoryCounts[service.category] || 0) + 1;
      });

      const categoriesWithServices = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count
      }));

      const stats: HomeStats = {
        serviceProvidersCount: serviceProvidersCount,
        publishedServicesCount: publishedServicesCount || 0,
        categoriesWithServices
      };

      console.log('Home stats fetched:', stats);
      return stats;
    },
    staleTime: 60000, // 1 minute
    retry: 1
  });
};
