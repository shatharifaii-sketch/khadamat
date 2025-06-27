
import { useQuery } from '@tanstack/react-query';
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
  profiles?: {
    full_name?: string;
    profile_image_url?: string;
  };
}

export const usePublicServices = () => {
  return useQuery({
    queryKey: ['public-services'],
    queryFn: async () => {
      console.log('Fetching public services...');
      
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles:user_id (
            full_name,
            profile_image_url
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }

      console.log('Fetched services:', data);
      return data as PublicService[];
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};
