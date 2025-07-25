
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessages = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      // First, get conversations where user is either client or provider
      const { data: userConversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`);

      if (convError) {
        console.error('Error fetching user conversations:', convError);
        return 0;
      }

      if (!userConversations || userConversations.length === 0) {
        return 0;
      }

      const conversationIds = userConversations.map(conv => conv.id);

      // Then get unread messages from those conversations
      const { data: unreadMessages, error: msgError } = await supabase
        .from('messages')
        .select('id')
        .in('conversation_id', conversationIds)
        .is('read_at', null)
        .neq('sender_id', user.id);

      if (msgError) {
        console.error('Error fetching unread messages:', msgError);
        return 0;
      }

      return unreadMessages?.length || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    gcTime: 10000, // Keep in cache for 10 seconds
  });
};
