
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  profiles?: {
    full_name?: string;
    profile_image_url?: string;
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
          filter: 'status=eq.published'
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
      console.log('Fetching public services...');
      
      // First, let's try to get all services without join to see if they exist
      const { data: allServices, error: allServicesError } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      console.log('All services (without join):', allServices, 'Error:', allServicesError);

      // Now try with the join
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles (
            full_name,
            profile_image_url
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services with profiles:', error);
        // Fallback to services without profile join if join fails
        if (allServices && !allServicesError) {
          console.log('Using fallback services without profile data');
          return allServices.map(service => ({
            ...service,
            profiles: null
          })) as PublicService[];
        }
        throw error;
      }

      console.log('Fetched services with profiles:', data);
      return data as PublicService[];
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};
