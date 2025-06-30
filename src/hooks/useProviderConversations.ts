
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
          services (title)
        `)
        .eq('provider_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching provider conversations:', error);
        throw error;
      }

      // Manually fetch profile data for each conversation
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conversation): Promise<Conversation> => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', conversation.client_id)
            .maybeSingle();

          return {
            ...conversation,
            profiles: profileData || { full_name: 'عميل' }
          };
        })
      );

      return conversationsWithProfiles;
    },
    enabled: !!user
  });
};
