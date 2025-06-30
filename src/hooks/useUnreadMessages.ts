
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessages = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          conversations!inner(
            provider_id,
            client_id
          )
        `)
        .is('read_at', null)
        .neq('sender_id', user.id);

      if (error) {
        console.error('Error fetching unread messages:', error);
        return 0;
      }

      // Filter messages where user is either client or provider
      const unreadMessages = data.filter(message => 
        message.conversations.client_id === user.id || 
        message.conversations.provider_id === user.id
      );

      return unreadMessages.length;
    },
    enabled: !!user,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};
