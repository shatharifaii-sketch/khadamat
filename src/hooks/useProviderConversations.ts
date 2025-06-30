
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Conversation } from './useConversations';

export const useProviderConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['provider-conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      console.log('🔍 Fetching provider conversations for user:', user?.id);
      
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
        .eq('provider_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching provider conversations:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Raw provider conversations data:', data);

      // Manually fetch profile data for each conversation
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conversation): Promise<Conversation> => {
          console.log('🔍 Fetching client profile for conversation:', conversation.id);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', conversation.client_id)
            .maybeSingle();

          if (profileError) {
            console.error('⚠️ Error fetching client profile:', profileError);
          }

          const result = {
            ...conversation,
            profiles: profileData || { full_name: 'عميل' }
          };

          console.log('✅ Provider conversation with profile:', result);
          return result;
        })
      );

      console.log('✅ Final provider conversations with profiles:', conversationsWithProfiles);
      return conversationsWithProfiles;
    },
    enabled: !!user
  });
};
