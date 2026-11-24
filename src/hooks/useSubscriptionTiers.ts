import { supabase } from "@/integrations/supabase/client"
import { Json } from "@/integrations/supabase/types";
import { useSuspenseQuery } from "@tanstack/react-query"

export type SubscriptionTierType = {
 allowed_services: number;
 badge_class_name: string;
 class_name: string;
 created_at: string;
 free_trial: boolean;
 free_trial_period: number;
 free_trial_period_text: string;
 id: string;
 notes: Json;
 notes_english: Json | null;
 price_monthly_title: string | null;
 price_monthly_value: number | null;
 price_yearly_title: string | null;
 price_yearly_value: number | null;
 stripe_monthly_price_id: string;
 stripe_product_id: string;
 stripe_yearly_price_id: string;
 tier: number | null;
 title: string | null;
 users: number;
}

export const useSubscriptionTiers = () => {
    const subscriptionTiers = useSuspenseQuery({
        queryKey: ['subscription-tiers'],
        queryFn: async () => {
            const { data, error } = await supabase
            .from('subscription_tiers')
            .select('*');

            if (error) {
                console.error('Error fetching subscription tiers:', error);
                throw new Error(error.message);
            }

            return data;
        }
    });

    return {
        subscriptionTiersData: subscriptionTiers.data,
        subscriptionTiersSuccess: subscriptionTiers.isSuccess
    }
}

export const useSubscriptionTierData = (tierId: string) => {
    const {
        data,
        error,
        isPending,
        isError
    } = useSuspenseQuery({
        queryKey: ['subscription-tiers', tierId],
        queryFn: async () => {
            const { data, error } = await supabase
            .from('subscription_tiers')
            .select('*')
            .eq('id', tierId)
            .maybeSingle();

            if (error) {
                console.error('Error fetching subscription tier data:', error);
                throw new Error(error.message);
            }

            return data;
        }
    });

    return {
        subscriptionTierData: data,
        subscriptionTierError: error,
        isSubscriptionTierError: isError,
        subscriptionTierIsPending: isPending
    }
}