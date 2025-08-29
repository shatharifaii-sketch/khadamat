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
      
      // Fetch services
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }

      if (!services || services.length === 0) {
        console.log('No services found');
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(services.map(s => s.user_id))];
      
      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profile data if profiles fetch fails
      }

      // Map profiles to services
      const data = services.map(service => ({
        ...service,
        profiles: profiles?.find(p => p.id === service.user_id) || null
      }));

      console.log('Fetched services with profiles:', data);
      return data as PublicService[];
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};