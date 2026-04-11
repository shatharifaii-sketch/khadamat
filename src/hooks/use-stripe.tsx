import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { Subscription } from "./useSubscription";

interface CheckoutSession {
    url: string;
}

interface StripeActions {
    createCheckoutSession: ({ priceId, userId, email }: { priceId: string, userId: string, email: string }) => void;
    isCreatingCheckoutSessionPending: boolean;
    isCreateCheckoutSessionError: boolean;
    isCreateCheckoutSessionSuccess: boolean;
    verifySession: (sessionId: string) => any;
    isVerifyingSessionPending: boolean;
    isVerifySessionError: boolean;
    isVerifySessionSuccess: boolean;
    billingPortalSession: (customerId: string) => void;
    isCreatingBillingPortalSession: boolean;
    isCreateBillingPortalSessionError: boolean;
    isCreateBillingPortalSessionSuccess: boolean;
}

const createStripeCheckoutSession = async ({ priceId, userId, email }: { priceId: string, userId: string, email: string }) => {
    if (!priceId) return;
    if (!userId) return;

    const { data, response, error } = await supabase.functions.invoke(
        "create-checkout-session-dev",
        {
            body: JSON.stringify({
                priceId,
                userId: userId,
                email: email
            }),
        }
    )

    if (error && !response.ok && !data.success) {
        console.log(error);
        return error;
    }

    return data.sessionUrl;
}

const verifyStripeSessionId = async (sessionId: string) => {
    const { data, error } = await supabase.functions.invoke(
        "verify-stripe-checkout-session-id-dev",
        {
            body: JSON.stringify({ sessionId }),
        }
    );

    if (error) {
        console.log(error);
        return error;
    }

    const { data: userSub, error: userSubError } = await supabase
        .from('subscriptions')
        .select(`*, 
          subscription_tier:subscriptions_tier_id_fkey (
            id,
            title,
            allowed_services,
            price_monthly_title,
            price_yearly_title,
            price_monthly_value,
            price_yearly_value,
            class_name,
            badge_class_name,
            free_trial_period_text,
            notes
          )`)
        .eq('user_id', data.subscription.metadata.user_id)
        .eq('status', 'active')
        .single();
    
    if (userSubError) {
        console.log(error);
        return error;
    }

    return userSub as Subscription;
}

const getBillingPortalSession = async (customerId: string) => {
    const { data, error } = await supabase.functions.invoke(
        "stripe-billing-portal-dev",
        {
            body: JSON.stringify({ customerId }),
        }
    );

    if (error) {
        console.log(error);
        return error;
    }

    return data.url;
}

const useStripe = (): StripeActions => {

    const {
        mutate: createCheckoutSession,
        isPending: isCreatingCheckoutSessionPending,
        isError: isCreateCheckoutSessionError,
        isSuccess: isCreateCheckoutSessionSuccess,
    } = useMutation({
        mutationKey: ['create-checkout-session'],
        mutationFn: createStripeCheckoutSession,
        onSuccess: (sessionUrl) => {
            console.log(sessionUrl);
            window.open(sessionUrl, "_blank", "noopener,noreferrer");
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const {
        mutateAsync: verifySession,
        isPending: isVerifyingSessionPending,
        isError: isVerifySessionError,
        isSuccess: isVerifySessionSuccess,
    } = useMutation({
        mutationKey: ['verify-session'],
        mutationFn: verifyStripeSessionId,
        onSuccess: (data) => {
            console.log(data);
        },
        onError: (error) => {
            console.log(error);
        }
    })

    const {
        mutateAsync: billingPortalSession,
        isPending: isCreatingBillingPortalSession,
        isError: isCreateBillingPortalSessionError,
        isSuccess: isCreateBillingPortalSessionSuccess,
    } = useMutation({
        mutationKey: ['create-billing-portal-session'],
        mutationFn: getBillingPortalSession,
        onSuccess: (portalUrl) => {
            console.log(portalUrl);
            window.open(portalUrl, "_blank", "noopener,noreferrer");
        },
        onError: (error) => {
            console.log(error);
        }
    })


    return {
        createCheckoutSession,
        isCreatingCheckoutSessionPending,
        isCreateCheckoutSessionError,
        isCreateCheckoutSessionSuccess,
        verifySession,
        isVerifyingSessionPending,
        isVerifySessionError,
        isVerifySessionSuccess,
        billingPortalSession,
        isCreatingBillingPortalSession,
        isCreateBillingPortalSessionError,
        isCreateBillingPortalSessionSuccess,
    }
}

export default useStripe