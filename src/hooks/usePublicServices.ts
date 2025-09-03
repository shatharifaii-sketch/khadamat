import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicService {
  id: string;
  title: string;
  category: string;
  description: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience?: string;
  views: number;
  created_at: string;
  user_id: string;
  updated_at: string;
  publisher: {
    id: string;
    full_name: string;
    profile_image_url: string;
  };
}

export const usePublicServices = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription for services...');

    const channel = supabase
      .channel('public-services-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'services',
        },
        (payload) => {
          console.log('Real-time service change detected:', payload);

          // Invalidate and refetch the services data
          queryClient.invalidateQueries({ queryKey: ['public-services'] });
          queryClient.invalidateQueries({ queryKey: ['home-stats'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription for services');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['public-services'],
    queryFn: async () => {
      const { data: services, error } = await supabase
        .from('services')
        .select(`
    *,
    publisher:fk_services_user_id (
      id,
      full_name,
      profile_image_url
    )
  `)
        .eq('status', 'published')

      if (error) {
        console.error('Error fetching public services:', error);
        return [];
      }

      console.log('Fetched services with publisher:', services);
      return services as PublicService[];
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};

export const useServiceData = (id: string) => {
  const { data: service } = useSuspenseQuery({
    queryKey: ['public-service-data', id],
    queryFn: async () => {
      const { data: service, error } = await supabase
        .from('services')
        .select(`
    *,
    publisher:fk_services_user_id (
      id,
      full_name,
      profile_image_url
    )
  `)
        .eq('status', 'published')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching public services:', error);
        return [];
      }

      console.log('Fetched services with publisher:', service);
      return service;
    }
  });

  return service as PublicService;
}
