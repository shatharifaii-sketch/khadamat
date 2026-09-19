import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client";
import { CreateDealSchemaType } from "@/types/deal";
import { QueryClient, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { success } from "zod";
import { fa } from "zod/v4/locales";

export type ChatDeal = {
    id: string;
    conversation_id: string;
    provider_id: string;
    client_id: string;
    service_id: string;
    price: number;
    status: string;
    created_by: string;
    currency: string;
    client_accepted: boolean;
    provider_accepted: boolean;
    client_rejected: boolean;
    provider_rejected: boolean;
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
    isCreatingDealSuccess: boolean;

    deleteDeal: (dealId: string) => void;
    isDeletingDealError: boolean;
    isDeletingDeal: boolean;
    isDeletingDealSuccess: boolean;

    acceptDeal: (dealId: string) => void;
    isAcceptingDeal: boolean;
    isAcceptingDealError: boolean;
    isAcceptingDealSuccess: boolean;

    rejectDeal: (dealId: string) => void;
    isRejectingDeal: boolean;
    isRejectingDealError: boolean;
    isRejectingDealSuccess: boolean;
}

async function createNewDeal(values: CreateDealSchemaType) {
    if (!values || !values.client_id || !values.conversation_id || !values.currency || !values.price || !values.provider_id) {
        return { success: false, error: "missing_data" }
    }

    const { data, error } = await supabase.functions.invoke("create-deal", {
        body: values
    });

    if (error) {
        console.error(error);
        return {
            success: false,
            error: error.message
        }
    }

    if (data.error && !data.success) {
        console.error(data.error);
        return {
            success: false,
            error: error
        }
    }

    return {
        success: true,
        error: null
    }
}

async function deleteDealWithId(dealId: string) {
    if (!dealId) return { success: false, error: "missing_data" }

    const { error } = await supabase.from("conversation_deals").delete().eq("id", dealId);

    if (error) {
        console.error("Error creating Deal: ", error);
        throw {
            success: false,
            error: error.message
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
    const { t } = useTranslation("chat");
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
                    currency,
                    client_accepted,
                    provider_accepted,
                    client_rejected,
                    provider_rejected,
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
        isSuccess: isCreatingDealSuccess
    } = useMutation({
        mutationKey: ["create-deal"],
        mutationFn: createNewDeal,
        onSuccess: ({ success, error }) => {
            if (error) {
                toast.error(t(error))
            } else if (success) {
                toast.success(t("deals.deal_created"))
            }
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
    });

    const {
        mutate: deleteDeal,
        isError: isDeletingDealError,
        isPending: isDeletingDeal,
        isSuccess: isDeletingDealSuccess
    } = useMutation({
        mutationKey: ["delete-deal"],
        mutationFn: deleteDealWithId,
        onSuccess: ({ success, error }) => {
            if (error) {
                toast.error(t(error))
            } else if (success) {
                toast.success(t("deals.deal_deleted"))
            }
            queryClient.invalidateQueries({
                queryKey: ["chat-deals", conversationId]
            })
        }
    });

    const {
        mutate: acceptDeal,
        isError: isAcceptingDealError,
        isPending: isAcceptingDeal,
        isSuccess: isAcceptingDealSuccess
    } = useMutation({
        mutationKey: ["accept-deal"],
        mutationFn: async (dealId: string) => {
            
        }
    })

    const {
        mutate: rejectDeal,
        isError: isRejectingDealError,
        isPending: isRejectingDeal,
        isSuccess: isRejectingDealSuccess
    } = useMutation({
        mutationKey: ["reject-deal"],
        mutationFn: async (dealId: string) => {
            
        }
    })

    return {
        deals,
        isDealsError,
        isDealsLoading,

        createDeal,
        isCreatingDealError,
        isCreatingDeal,
        isCreatingDealSuccess,

        deleteDeal,
        isDeletingDealError,
        isDeletingDeal,
        isDeletingDealSuccess,

        acceptDeal,
        isAcceptingDeal,
        isAcceptingDealError,
        isAcceptingDealSuccess,

        rejectDeal,
        isRejectingDeal,
        isRejectingDealError,
        isRejectingDealSuccess
    }
}