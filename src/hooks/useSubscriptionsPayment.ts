import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSuspenseQuery } from "@tanstack/react-query"

interface SubscriptionTransaction {
    id: string;
    currency: string;
    payment_date: string;
    payment_status: string;
    coupon_used: boolean;
    coupon?: {
        code: string;
        type: string;
    } | null;
    subscription?: {
        tier: {
            title: string;
        },
        billing_cycle: string | null;
        started_at: string;
        expires_at: string;
        services_allowed: number;
        services_used: number;
    },
    amount: number;
}

export const useSubscriptionsPayment = () => {
    const { user } = useAuth();

    const getUserTransactions = useSuspenseQuery({
        queryKey: ['subscriptions-transactions', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('subscription_transactions')
                .select(`
                    *,
                    subscription: subscription_transactions_subscription_id_fkey (
                        tier: subscriptions_tier_id_fkey (title),
                        billing_cycle,
                        started_at,
                        expires_at,
                        services_allowed,
                        services_used
                    ),
                    coupon: subscription_transactions_coupon_id_fkey (
                        code,
                        type
                    )
                    `)
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data as SubscriptionTransaction[];
        }
    });

    return {
        paymentTransactions: getUserTransactions.data || [],
    }
}