import { useAuth } from "@/contexts/AuthContext";
import { Message, useChat } from "@/contexts/ChatContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

export interface EnrichedConversation {
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
    };
    last_message: string;
    unread_messages_count: number;
    last_message_sender_id: string | null;
    last_message_sender_name: string | null;
}

const getConvoMessagesData = async (conversationId: string, userId: string) => {
    const { data: messages, error } = await supabase.from('messages').select(
        `
                    *,
                    sender:messages_sender_id_fkey1 (
                        id,
                        full_name
                    )
                `
    ).eq('conversation_id', conversationId);

    if (error) {
        console.error(error);
        throw error;
    }

    const lastMessage = messages[messages.length - 1];
    const unreadMessagesCount = messages.filter(m => !m.read_at && m.sender_id !== userId).length;

    return { lastMessage, unreadMessagesCount };
}

export const useConversations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const getConversations = useSuspenseQuery({
        queryKey: ['get-conversations', user?.id],
        queryFn: async () => {
            const { data: conversations, error } = await supabase.from('conversations')
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
                .or(`client_id.eq.${user!.id},provider_id.eq.${user!.id}`)
                .order('last_message_at', { ascending: false });

            if (error) {
                console.error(error);
                throw error;
            }

            const enrichedConversations = await Promise.all(
                conversations.map(async (convo) => {
                    const { lastMessage, unreadMessagesCount } = await getConvoMessagesData(convo.id, user!.id);

                    return {
                        ...convo,
                        last_message: lastMessage?.content,
                        unread_messages_count: unreadMessagesCount,
                        last_message_sender_id: lastMessage?.sender_id,
                        last_message_sender_name: lastMessage?.sender.full_name
                    }
                })
            )

            return enrichedConversations as EnrichedConversation[];
        }
    })

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
                .select('id')
                .single();

            if (error) {
                console.error(error);
                throw error;
            }

            toast.success(`تم بدء المحادثة مع ${providerName}`);

            return {
                id: data.id
            }
        }
    });

    return {
        conversations: getConversations.data,
        conversationsError: getConversations.error,
        startConversation,
        startConversationSuccess: startConversation.isSuccess
    }
}

export const useConversationData = ({ conversationId }: { conversationId: string | null }) => {
    const { setActiveConversation } = useChat();
    const { user } = useAuth();
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

    if (!getConversation.data) return { conversation: null };

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