
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  service_id: string;
  client_id: string;
  provider_id: string;
  status: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  services?: {
    title: string;
  } | null;
  profiles?: {
    full_name: string;
  } | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getConversations = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          services (title),
          profiles!conversations_provider_id_fkey (full_name)
        `)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        
        // Fallback query without profiles join if the foreign key doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('conversations')
          .select(`
            *,
            services (title)
          `)
          .order('last_message_at', { ascending: false });

        if (fallbackError) {
          throw fallbackError;
        }

        // Manually fetch profile data for each conversation
        const conversationsWithProfiles = await Promise.all(
          (fallbackData || []).map(async (conversation) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', conversation.provider_id)
              .maybeSingle();

            return {
              ...conversation,
              profiles: profileData
            };
          })
        );

        return conversationsWithProfiles;
      }

      return data || [];
    },
    enabled: !!user
  });

  const createConversation = useMutation({
    mutationFn: async ({ serviceId, providerId }: { serviceId: string; providerId: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('service_id', serviceId)
        .eq('client_id', user.id)
        .eq('provider_id', providerId)
        .maybeSingle();

      if (existing) {
        return existing;
      }

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
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      console.error('Error creating conversation:', error);
      toast.error('فشل في إنشاء المحادثة');
    }
  });

  return {
    getConversations,
    createConversation,
    isCreating: createConversation.isPending
  };
};
