
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Conversation } from './useConversations';

// Type guard to check if the profiles data is an error
const isSelectQueryError = (data: any): data is { error: true } => {
  return data && typeof data === 'object' && data.error === true;
};

// Type guard to check if profiles data is valid
const isValidProfileData = (data: any): data is { full_name: string } => {
  return data && typeof data === 'object' && typeof data.full_name === 'string';
};

export const useProviderConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['provider-conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          services (title),
          profiles!conversations_client_id_fkey (full_name)
        `)
        .eq('provider_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching provider conversations:', error);
        
        // Fallback query without profiles join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('conversations')
          .select(`
            *,
            services (title)
          `)
          .eq('provider_id', user.id)
          .order('last_message_at', { ascending: false });

        if (fallbackError) {
          throw fallbackError;
        }

        // Manually fetch profile data for each conversation
        const conversationsWithProfiles = await Promise.all(
          (fallbackData || []).map(async (conversation): Promise<Conversation> => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', conversation.client_id)
              .maybeSingle();

            return {
              ...conversation,
              profiles: profileData || { full_name: 'عميل' }
            };
          })
        );

        return conversationsWithProfiles;
      }

      // Map the data to ensure proper typing and handle profile data safely
      return (data || []).map((item): Conversation => {
        // Safely extract profile data with proper type checking
        let profileData: { full_name: string };
        
        if (isValidProfileData(item.profiles)) {
          profileData = item.profiles;
        } else if (isSelectQueryError(item.profiles)) {
          console.warn('Profile data error for conversation:', item.id, item.profiles);
          profileData = { full_name: 'عميل' };
        } else if (item.profiles === null || item.profiles === undefined) {
          profileData = { full_name: 'عميل' };
        } else {
          console.warn('Unexpected profile data type:', item.profiles);
          profileData = { full_name: 'عميل' };
        }

        return {
          id: item.id,
          service_id: item.service_id,
          client_id: item.client_id,
          provider_id: item.provider_id,
          status: item.status,
          last_message_at: item.last_message_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
          services: item.services,
          profiles: profileData
        };
      });
    },
    enabled: !!user
  });
};
