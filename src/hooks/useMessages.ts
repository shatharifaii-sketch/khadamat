
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
      console.log('🔍 Fetching messages for conversation:', conversationId);
      
      if (!conversationId) {
        console.log('❌ No conversation ID provided');
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

      console.log('✅ Fetched messages:', data?.length || 0);
      return data as Message[];
    },
    enabled: !!conversationId,
    staleTime: 1000, // Consider data stale after 1 second
    gcTime: 5000, // Keep in cache for 5 seconds
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      console.log('🚀 Sending message:', { content, conversationId, userId: user?.id });

      if (!user || !conversationId) {
        console.error('❌ Missing required data:', { user: !!user, conversationId });
        throw new Error('Missing required data');
      }

      if (!content.trim()) {
        console.error('❌ Empty message content');
        throw new Error('Message content cannot be empty');
      }

      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        message_type: 'text'
      };

      console.log('📤 Inserting message data:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Successfully sent message:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Message sent successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    },
    onError: (error: any) => {
      console.error('💥 Message sending failed:', error);
      toast.error(`فشل في إرسال الرسالة: ${error.message}`);
    }
  });

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    console.log('🔄 Setting up real-time subscription for conversation:', conversationId);

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
          console.log('📨 Real-time message received:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return {
    getMessages,
    sendMessage,
    isSending: sendMessage.isPending
  };
};
