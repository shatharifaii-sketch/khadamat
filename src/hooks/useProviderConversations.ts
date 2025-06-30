
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Conversation } from './useConversations';

export const useProviderConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['provider-conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          services (title),
          profiles!conversations_client_id_fkey (full_name)
        `)
        .eq('provider_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching provider conversations:', error);
        
        // Fallback query without profiles join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('conversations')
          .select(`
            *,
            services (title)
          `)
          .eq('provider_id', user.id)
          .order('last_message_at', { ascending: false });

        if (fallbackError) {
          throw fallbackError;
        }

        // Manually fetch profile data for each conversation
        const conversationsWithProfiles = await Promise.all(
          (fallbackData || []).map(async (conversation): Promise<Conversation> => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', conversation.client_id)
              .maybeSingle();

            return {
              ...conversation,
              profiles: profileData
            };
          })
        );

        return conversationsWithProfiles;
      }

      // Map the data to ensure proper typing
      return (data || []).map((item): Conversation => ({
        id: item.id,
        service_id: item.service_id,
        client_id: item.client_id,
        provider_id: item.provider_id,
        status: item.status,
        last_message_at: item.last_message_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        services: item.services,
        profiles: item.profiles
      }));
    },
    enabled: !!user
  });
};
