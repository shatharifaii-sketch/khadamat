
import { useOptimizedConversations } from './useOptimizedConversations';
import { useAuth } from '@/contexts/AuthContext';

export const useProviderConversations = () => {
  const { user } = useAuth();
  const { conversations: allConversations = [], isLoading, error } = useOptimizedConversations();

  // Filter conversations where the user is the provider
  const providerConversations = allConversations.filter(
    conversation => conversation.provider_id === user?.id
  );

  return {
    data: providerConversations,
    isLoading,
    error
  };
};
