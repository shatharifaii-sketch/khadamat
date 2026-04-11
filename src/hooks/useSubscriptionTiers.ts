import { supabase } from "@/integrations/supabase/client"
import { useSuspenseQuery } from "@tanstack/react-query"

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