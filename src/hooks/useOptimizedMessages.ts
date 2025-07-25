import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
}

export const useOptimizedMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getMessages = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw error;
      }

      return data as Message[];
    },
    enabled: !!conversationId,
    staleTime: 10000, // Consider data stale after 10 seconds for real-time feel
    gcTime: 60000, // Keep in cache for 1 minute
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!user || !conversationId) {
        throw new Error('يجب تسجيل الدخول لإرسال الرسائل');
      }

      if (!content.trim()) {
        throw new Error('لا يمكن إرسال رسالة فارغة');
      }

      console.log('📤 Preparing to send message:', { conversationId, userId: user.id, contentLength: content.trim().length });
      
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        message_type: 'text',
        topic: `conversation_${conversationId}`,
        extension: 'chat'
      };

      console.log('📋 Message data prepared:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        console.error('❌ Message data that failed:', messageData);
        throw new Error('فشل في إرسال الرسالة');
      }

      console.log('✅ Message sent successfully:', data);
      return data;
    },
    onMutate: async ({ content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(['messages', conversationId]);

      // Optimistically update to the new value
      if (user && conversationId) {
        const optimisticMessage: Message = {
          id: 'temp-' + Date.now(),
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text',
          read_at: null,
          created_at: new Date().toISOString()
        };

        queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => [
          ...old,
          optimisticMessage
        ]);
      }

      // Return context object with snapshotted value
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages);
      }
      toast.error('فشل في إرسال الرسالة. حاول مرة أخرى.');
    },
    onSuccess: () => {
      // Invalidate and refetch messages to get the real data
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['optimized-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    }
  });

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Only update if the message is from another user
          if (payload.new.sender_id !== user?.id) {
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          }
          queryClient.invalidateQueries({ queryKey: ['optimized-conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['optimized-conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, user?.id]);

  return {
    messages: getMessages.data || [],
    isLoading: getMessages.isLoading,
    error: getMessages.error,
    sendMessage,
    isSending: sendMessage.isPending,
    refetch: getMessages.refetch
  };
};