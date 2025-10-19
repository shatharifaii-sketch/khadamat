import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface Conversation {
    id: string;
    service_id: string;
    client_id: string;
    provider_id: string;
    status: 'active' | 'archived' | 'closed';
    last_message_at: string | null;
    created_at: string;
    updated_at: string;
}

export const useConversations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const startConversation = useMutation({
        mutationKey: ['start-conversation'],
        mutationFn: async ({ serviceId, providerId, providerName }: { serviceId: string; providerId: string; providerName: string }) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase.from('conversations').insert([{
                service_id: serviceId,
                client_id: user.id,
                provider_id: providerId,
            }]).select('*').single();

            if (error) {
                console.error(error);
                throw error;
            }

            toast.success(`تم بدء المحادثة مع ${providerName}`);

            return () => {
                navigate(`/chat/${data.id}/${data.client_id}/${data.service_id}/${data.provider_id}`);
            }
        }
    });

    return {
        startConversation,
    }
}

export const useConversationData = ({conversationId}: {conversationId: string | null}) => {
    const getConversation = useSuspenseQuery({
        queryKey: ['get-conversation', conversationId],
        queryFn: async () => {
            const { data: conversation, error } = await supabase.from('conversations').select('*')
                .eq('id', conversationId).single();

            if (error) {
                console.error(error);
                throw error;
            }

            return conversation;
        }
    });

    return {
        conversation: getConversation.data,
        conversationError: getConversation.error,
        conversationLoading: getConversation.isLoading
    } as {
        conversation: Conversation | null;
        conversationError: unknown;
        conversationLoading: boolean;
    }
}