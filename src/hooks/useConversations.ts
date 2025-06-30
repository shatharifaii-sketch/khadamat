
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
    queryFn: async (): Promise<Conversation[]> => {
      console.log('🔍 Fetching conversations for user:', user?.id);
      
      if (!user) {
        console.log('❌ No user found, returning empty array');
        return [];
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          services (title)
        `)
        .eq('client_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching conversations:', error);
        throw error;
      }

      console.log('✅ Raw conversations data:', data);

      // Manually fetch profile data for each conversation (provider data)
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conversation): Promise<Conversation> => {
          console.log('🔍 Fetching provider profile for conversation:', conversation.id);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', conversation.provider_id)
            .maybeSingle();

          if (profileError) {
            console.error('⚠️ Error fetching provider profile:', profileError);
          }

          const result = {
            ...conversation,
            profiles: profileData || { full_name: 'مقدم الخدمة' }
          };

          console.log('✅ Conversation with profile:', result);
          return result;
        })
      );

      console.log('✅ Final conversations with profiles:', conversationsWithProfiles);
      return conversationsWithProfiles;
    },
    enabled: !!user
  });

  const createConversation = useMutation({
    mutationFn: async ({ serviceId, providerId }: { serviceId: string; providerId: string }) => {
      console.log('🚀 Creating conversation:', { serviceId, providerId, userId: user?.id });

      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!serviceId || !providerId) {
        console.error('❌ Missing required parameters:', { serviceId, providerId });
        throw new Error('Missing service ID or provider ID');
      }

      // Check if conversation already exists
      console.log('🔍 Checking for existing conversation...');
      const { data: existing, error: existingError } = await supabase
        .from('conversations')
        .select('id')
        .eq('service_id', serviceId)
        .eq('client_id', user.id)
        .eq('provider_id', providerId)
        .maybeSingle();

      if (existingError) {
        console.error('❌ Error checking existing conversation:', existingError);
        throw existingError;
      }

      if (existing) {
        console.log('✅ Found existing conversation:', existing);
        return existing;
      }

      // Create new conversation
      console.log('🔨 Creating new conversation...');
      const conversationData = {
        service_id: serviceId,
        client_id: user.id,
        provider_id: providerId
      };
      
      console.log('📤 Inserting conversation data:', conversationData);
      
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating conversation:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Successfully created conversation:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Conversation creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] });
      toast.success('تم إنشاء المحادثة بنجاح');
    },
    onError: (error: any) => {
      console.error('💥 Conversation creation failed:', error);
      toast.error(`فشل في إنشاء المحادثة: ${error.message}`);
    }
  });

  return {
    getConversations,
    createConversation,
    isCreating: createConversation.isPending
  };
};
