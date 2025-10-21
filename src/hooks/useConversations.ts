import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
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
    provider: {
        id: string;
        full_name: string;
        profile_image_url: string;
    };
    service: {
        id: string;
        title: string;
        description: string;
        price_range: string;
        location: string;
        phone: string;
        email: string;
        created_at: string;
        updated_at: string;
    }
}

export const useConversations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const startConversation = useMutation({
        mutationKey: ['start-conversation'],
        mutationFn: async ({ serviceId, providerId, providerName }: { serviceId: string; providerId: string; providerName: string }) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase.from('conversations')
            .insert([{
                service_id: serviceId,
                client_id: user.id,
                provider_id: providerId,
            }])
            .select('*')
            .single();

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
    const { setActiveConversation } = useChat();
    const getConversation = useSuspenseQuery({
        queryKey: ['get-conversation', conversationId],
        queryFn: async () => {
            const { data: conversation, error } = await supabase.from('conversations')
            .select(`
                *,
                provider:conversations_provider_id_fkey (
                    id,
                    full_name,
                    profile_image_url
                ),
                service:conversations_service_id_fkey (
                    id,
                    title,
                    description,
                    price_range,
                    location,
                    phone,
                    email,
                    created_at,
                    updated_at
                )
                `)
            .eq('id', conversationId)
            .single();

            if (error) {
                console.error(error);
                throw error;
            }

            return conversation;
        }
    });

    if (!getConversation.data) return {conversation: null};

    useEffect(() => {
        if (!conversationId) return;

        if (getConversation.data) {
            setActiveConversation(getConversation.data);
        }
        
    }, [conversationId, getConversation.data]);

    return {
        conversation: getConversation.data,
    } as {
        conversation: Conversation;
    }
}