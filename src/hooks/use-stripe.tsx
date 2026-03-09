import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";

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
}

const createStripeCheckoutSession = async ({ priceId, userId, email }: { priceId: string, userId: string, email: string }) => {
    const { data, response, error } = await supabase.functions.invoke(
        "create-checkout-session",
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
        "verify-stripe-checkout-session-id",
        {
            body: JSON.stringify({ sessionId }),
        }
    );

    if (error) {
        console.log(error);
        return error;
    }

    return data;
}

const useStripe = (): StripeActions => {
    const { user } = useAuth();

    if (!user) return null;

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
        mutate: verifySession,
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


    return {
        createCheckoutSession,
        isCreatingCheckoutSessionPending,
        isCreateCheckoutSessionError,
        isCreateCheckoutSessionSuccess,
        verifySession,
        isVerifyingSessionPending,
        isVerifySessionError,
        isVerifySessionSuccess
    }
}

export default useStripe