
import { useQuery } from '@tanstack/react-query';
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
  return useQuery({
    queryKey: ['home-stats'],
    queryFn: async (): Promise<HomeStats> => {
      console.log('Fetching home statistics...');
      
      // Get count of service providers (profiles with is_service_provider = true)
      const { data: serviceProviders, error: providersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_service_provider', true);

      if (providersError) {
        console.error('Error fetching service providers count:', providersError);
      }

      // Get count of published services
      const { data: publishedServices, error: servicesError } = await supabase
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
        serviceProvidersCount: serviceProviders?.length || 0,
        publishedServicesCount: publishedServices?.length || 0,
        categoriesWithServices
      };

      console.log('Home stats fetched:', stats);
      return stats;
    },
    staleTime: 60000, // 1 minute
    retry: 1
  });
};
