
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Message } from './useConversations';

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getMessages = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) {
        return [];
      }

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
    staleTime: 30000, // Consider data stale after 30 seconds
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

      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        message_type: 'text'
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw new Error('فشل في إرسال الرسالة');
      }

      return data;
    },
    onSuccess: () => {
      // Optimistically update the messages list
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    },
    onError: (error: any) => {
      console.error('💥 Message sending failed:', error);
      toast.error('فشل في إرسال الرسالة. حاول مرة أخرى.');
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
          queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, user?.id]);

  return {
    getMessages,
    sendMessage,
    isSending: sendMessage.isPending
  };
};
