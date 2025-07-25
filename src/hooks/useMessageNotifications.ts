import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useMessageNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for new messages across all conversations
    const channel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Only show notifications for messages not sent by current user
          if (payload.new.sender_id !== user.id) {
            // Check if this message is in a conversation where the user is involved
            supabase
              .from('conversations')
              .select('id, service_id, services(title)')
              .eq('id', payload.new.conversation_id)
              .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
              .single()
              .then(({ data }) => {
                if (data) {
                  toast.info('رسالة جديدة!', {
                    description: `في محادثة: ${data.services?.title || 'خدمة'}`,
                    duration: 3000,
                  });
                }
              });

            // Update unread messages count
            queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
};