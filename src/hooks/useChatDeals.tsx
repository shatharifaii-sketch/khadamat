import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client";
import { CreateDealSchemaType } from "@/types/deal";
import { QueryClient, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { success } from "zod";

export type ChatDeal = {
    id: string;
    conversation_id: string;
    provider_id: string;
    client_id: string;
    service_id: string;
    price: number;
    status: string;
    created_by: string;
    provider: {
        full_name: string;
        phone: string;
    };
    client: {
        full_name: string;
        phone: string;
    };
    service: {
        title: string;
        price_range: string;
        location: string;
        is_online: boolean;
    }
}

interface ChatDealsProps {
    conversationId: string;
}

interface ChatDealsReturnType {
    deals: ChatDeal[];
    isDealsError: boolean;
    isDealsLoading: boolean;

    createDeal: (values: CreateDealSchemaType) => void;
    isCreatingDealError: boolean;
    isCreatingDeal: boolean;
}

async function createNewDeal(values: CreateDealSchemaType) {
    const { error } = await supabase
        .from("conversation_deals")
        .insert({
            provider_id: values.provider_id,
            client_id: values.client_id,
            service_id: values.service_id,
            created_by: values.created_by,
            conversation_id: values.conversation_id
        });
    
    if (error) {
        console.error("Error creating Deal: ", error);
        throw {
            success: false,
            error
        }
    }

    return {
        success: true,
        error: null
    }
}

export const useChatDeals = ({
    conversationId
}: ChatDealsProps): ChatDealsReturnType => {
    const { t } = useTranslation("chats");
    const { user } = useAuth();

    const queryClient = useQueryClient();
    
    const {
        data: deals,
        isError: isDealsError,
        isLoading: isDealsLoading
    } = useSuspenseQuery({
        queryKey: ["chat-deals", conversationId],
        queryFn: async () => {
            const { data, error } = await supabase
            .from("conversation_deals")
            .select(`
                    id,
                    conversation_id,
                    provider_id,
                    client_id,
                    service_id,
                    price,
                    status,
                    created_by,
                    provider:profiles!conversation_deals_provider_id_fkey(
                        full_name,
                        phone
                    ),
                    client:profiles!conversation_deals_client_id_fkey(
                        full_name,
                        phone
                    ),
                    service:services!conversation_deals_service_id_fkey(
                        title,
                        price_range,
                        location,
                        is_online
                    )
                `)
                .order("created_at", { ascending: false });

            
            if (error) {
                console.error("Error fetching deals!", error);
                throw error;
            }

            return data as ChatDeal[];
        }
    });

    const {
        mutate: createDeal,
        isError: isCreatingDealError,
        isPending: isCreatingDeal,
    } = useMutation({
        mutationKey: ["create-deal"],
        mutationFn: createNewDeal,
        onSuccess: () => {
            toast.success(t("deals.deal_created"))
            queryClient.invalidateQueries({
                queryKey: ["chat-deals", conversationId]
            })
        },
        onError: () => {
            toast.error(t("deals.error_creating_deal"))
            queryClient.invalidateQueries({
                queryKey: ["chat-deals", conversationId]
            })
        }
    })

    return {
        deals,
        isDealsError,
        isDealsLoading,

        createDeal,
        isCreatingDealError,
        isCreatingDeal
    }
}