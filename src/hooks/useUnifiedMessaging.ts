import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

export interface ConversationDetail {
  id: string;
  service_id: string;
  client_id: string;
  provider_id: string;
  status: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  service_title: string;
  other_party_name: string;
  conversation_type: 'client' | 'provider';
  unread_count: number;
}

export const useUnifiedMessaging = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Fetch all conversations for the user
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['unified-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_conversation_details', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Error fetching conversations:', error);
        throw error;
      }

      return data as ConversationDetail[];
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch messages for selected conversation
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['unified-messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw error;
      }

      return data as Message[];
    },
    enabled: !!selectedConversation,
    staleTime: 5000,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!user || !selectedConversation) {
        throw new Error('المستخدم أو المحادثة غير متوفرة');
      }

      if (!content.trim()) {
        throw new Error('لا يمكن إرسال رسالة فارغة');
      }

      const messageData = {
        conversation_id: selectedConversation,
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
      // Refresh both messages and conversations
      queryClient.invalidateQueries({ queryKey: ['unified-messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['unified-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    },
    onError: (error: any) => {
      console.error('💥 Message sending failed:', error);
      toast.error('فشل في إرسال الرسالة. حاول مرة أخرى.');
    }
  });

  // Real-time subscription for conversations and messages
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('unified-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `client_id=eq.${user.id},provider_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unified-conversations'] });
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('unified-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Check if this message belongs to user's conversations
          const messageConversationId = payload.new.conversation_id;
          const isForCurrentUser = conversations.some(conv => conv.id === messageConversationId);
          
          if (isForCurrentUser) {
            queryClient.invalidateQueries({ queryKey: ['unified-messages', messageConversationId] });
            queryClient.invalidateQueries({ queryKey: ['unified-conversations'] });
            queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, queryClient, conversations]);

  // Helper functions
  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversation(conversationId);
  }, []);

  const getConversationDetails = useCallback((conversation: ConversationDetail) => {
    return {
      otherPartyName: conversation.other_party_name || 'مستخدم',
      context: conversation.conversation_type === 'client' 
        ? `محادثة حول: ${conversation.service_title || 'خدمة محذوفة'}`
        : `استفسار حول: ${conversation.service_title || 'خدمة محذوفة'}`,
      roleLabel: conversation.conversation_type === 'client' ? 'استفسار أرسلته' : 'استفسار وارد'
    };
  }, []);

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return {
    // Data
    conversations,
    messages,
    selectedConversation,
    selectedConversationData,
    
    // Loading states
    conversationsLoading,
    messagesLoading,
    isSending: sendMessage.isPending,
    
    // Error states
    conversationsError,
    messagesError,
    
    // Actions
    selectConversation,
    sendMessage: sendMessage.mutateAsync,
    refetchConversations,
    refetchMessages,
    
    // Helpers
    getConversationDetails
  };
};