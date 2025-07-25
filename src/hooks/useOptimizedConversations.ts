import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

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

export const useOptimizedConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch conversations using the optimized database function
  const getConversations = useQuery({
    queryKey: ['optimized-conversations', user?.id],
    queryFn: async (): Promise<ConversationDetail[]> => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_conversation_details', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Error fetching optimized conversations:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        conversation_type: item.conversation_type as 'client' | 'provider'
      }));
    },
    enabled: !!user,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });

  // Create conversation mutation
  const createConversation = useMutation({
    mutationFn: async ({ serviceId, providerId }: { serviceId: string; providerId: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if conversation already exists
      const { data: existing, error: existingError } = await supabase
        .from('conversations')
        .select('id')
        .eq('service_id', serviceId)
        .eq('client_id', user.id)
        .eq('provider_id', providerId)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existing) return existing;

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          service_id: serviceId,
          client_id: user.id,
          provider_id: providerId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimized-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
      toast.success('تم إنشاء المحادثة بنجاح');
    },
    onError: (error: any) => {
      toast.error(`فشل في إنشاء المحادثة: ${error.message}`);
    }
  });

  // Mark messages as read mutation
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.rpc('mark_message_as_read', {
        message_id: messageId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimized-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['optimized-conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `provider_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['optimized-conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Only invalidate if this message affects user's conversations
          queryClient.invalidateQueries({ queryKey: ['optimized-conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
          
          // Optimistic update for new messages
          if (payload.eventType === 'INSERT' && payload.new.sender_id !== user.id) {
            queryClient.invalidateQueries({ queryKey: ['messages', payload.new.conversation_id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [user?.id, queryClient]);

  return {
    conversations: getConversations.data || [],
    isLoading: getConversations.isLoading,
    error: getConversations.error,
    refetch: getConversations.refetch,
    createConversation,
    markAsRead,
    isCreating: createConversation.isPending
  };
};