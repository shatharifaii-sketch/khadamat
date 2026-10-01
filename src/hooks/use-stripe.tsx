import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { Subscription } from "./useSubscription";
import { toast } from "sonner";

interface CheckoutSession {
  url: string;
}

interface StripeActions {
  createCheckoutSession: ({
    priceId,
    userId,
    email,
  }: {
    priceId: string;
    userId: string;
    email: string;
  }) => void;
  isCreatingCheckoutSessionPending: boolean;
  isCreateCheckoutSessionError: boolean;
  isCreateCheckoutSessionSuccess: boolean;

  verifySession: (sessionId: string) => Promise<Subscription>;
  isVerifyingSessionPending: boolean;
  isVerifySessionError: boolean;
  isVerifySessionSuccess: boolean;

  verifyExtraSession: (sessionId: string) => Promise<boolean>;
  isVerifyingExtraSessionPending: boolean;
  isVerifyExtraSessionError: boolean;
  isVerifyExtraSessionSuccess: boolean;

  billingPortalSession: (customerId: string) => void;
  isCreatingBillingPortalSession: boolean;
  isCreateBillingPortalSessionError: boolean;
  isCreateBillingPortalSessionSuccess: boolean;

  createExtraCheckoutSession: ({
    userId,
    email,
    name,
  }: {
    userId: string;
    email: string;
    name: string;
  }) => void;
  isCreatingExtraCheckoutSessionPending: boolean;
  isCreateExtraCheckoutSessionError: boolean;
  isCreateExtraCheckoutSessionSuccess: boolean;
}

const createStripeCheckoutSession = async ({
  priceId,
  userId,
  email,
}: {
  priceId: string;
  userId: string;
  email: string;
}) => {
  if (!priceId) return;
  if (!userId) return;

  const lang = localStorage.getItem("language") || "en";

  if (!email || email.length < 3) {
    toast.warning(lang == "ar" ? "لا يوجد بريد الكتروني!" : "No email found!", {
      description:
        lang == "ar"
          ? "الايميل مطلوب لبدء اللإشتراك!"
          : "An email is required for a subscription!",
    });
    return { error: "no_email" };
  }

  const { data, response, error } = await supabase.functions.invoke(
    "create-checkout-session",
    {
      body: JSON.stringify({
        priceId,
        userId: userId,
        email: email,
      }),
    },
  );

  if (error && !response.ok) {
    console.log(error);

    return error;
  }

  if (data.error && !data.success && (typeof data.error == "string" && data.error == "no_email")) {
        toast.warning(
          lang == "ar" ? "لا يوجد بريد الكتروني!" : "No email found!",
          {
            description:
              lang == "ar"
                ? "الايميل مطلوب لبدء اللإشتراك!"
                : "An email is required for a subscription!",
          },
        );

        return;
  }

  return data.sessionUrl;
};

const verifyStripeSessionId = async (sessionId: string) => {
  const { data, error } = await supabase.functions.invoke(
    "verify-stripe-checkout-session-id",
    {
      body: JSON.stringify({ sessionId }),
    },
  );

  if (error) {
    console.log(error);
    return error;
  }

  const { data: userSub, error: userSubError } = await supabase
    .from("subscriptions")
    .select(
      `*, 
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
          )`,
    )
    .eq("user_id", data.subscription.metadata.user_id)
    .eq("status", "active")
    .maybeSingle();

  if (userSubError) {
    console.log(error);
    return error;
  }

  return userSub as Subscription;
};

const verifyExtraStripeSessionId = async (
  sessionId: string,
): Promise<boolean> => {
  const { data, error } = await supabase.functions.invoke(
    "verify-extra-stripe-checkout-session-id",
    {
      body: JSON.stringify({ sessionId }),
    },
  );

  if (error) {
    console.error(error);
    return false;
  }

  return true;
};

const getBillingPortalSession = async (customerId: string) => {
  const { data, error } = await supabase.functions.invoke(
    "stripe-billing-portal",
    {
      body: JSON.stringify({ customerId }),
    },
  );

  if (error) {
    console.log(error);
    return error;
  }

  return data.url;
};

const createExtraStripeCheckoutSession = async ({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name: string;
}) => {
  console.log("Creating extra checkout session for user:", userId, email, name);

  const { data, response, error } = await supabase.functions.invoke(
    "create-extra-product-checkout-session",
    {
      body: {
        userId: userId,
        email: email,
        name: name,
      },
    },
  );

  if (error && !response.ok && !data.success) {
    console.log(error);
    return error;
  }

  return data.sessionUrl;
};

const useStripe = (): StripeActions => {
  const {
    mutate: createCheckoutSession,
    isPending: isCreatingCheckoutSessionPending,
    isError: isCreateCheckoutSessionError,
    isSuccess: isCreateCheckoutSessionSuccess,
  } = useMutation({
    mutationKey: ["create-checkout-session"],
    mutationFn: createStripeCheckoutSession,
    onSuccess: (sessionUrl) => {
      if (sessionUrl.error) return;
      window.open(sessionUrl, "_blank", "noopener,noreferrer");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    mutateAsync: verifySession,
    isPending: isVerifyingSessionPending,
    isError: isVerifySessionError,
    isSuccess: isVerifySessionSuccess,
  } = useMutation({
    mutationKey: ["verify-session"],
    mutationFn: verifyStripeSessionId,
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    mutateAsync: billingPortalSession,
    isPending: isCreatingBillingPortalSession,
    isError: isCreateBillingPortalSessionError,
    isSuccess: isCreateBillingPortalSessionSuccess,
  } = useMutation({
    mutationKey: ["create-billing-portal-session"],
    mutationFn: getBillingPortalSession,
    onSuccess: (portalUrl) => {
      console.log(portalUrl);
      window.open(portalUrl, "_blank", "noopener,noreferrer");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    mutateAsync: createExtraCheckoutSession,
    isPending: isCreatingExtraCheckoutSessionPending,
    isError: isCreateExtraCheckoutSessionError,
    isSuccess: isCreateExtraCheckoutSessionSuccess,
  } = useMutation({
    mutationKey: ["create-extra-checkout-session"],
    mutationFn: createExtraStripeCheckoutSession,
    onSuccess: (sessionUrl) => {
      console.log(sessionUrl);
      window.open(sessionUrl, "_blank", "noopener,noreferrer");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    mutateAsync: verifyExtraSession,
    isPending: isVerifyingExtraSessionPending,
    isError: isVerifyExtraSessionError,
    isSuccess: isVerifyExtraSessionSuccess,
  } = useMutation({
    mutationKey: ["verify-extra-session"],
    mutationFn: verifyExtraStripeSessionId,
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return {
    createCheckoutSession,
    isCreatingCheckoutSessionPending,
    isCreateCheckoutSessionError,
    isCreateCheckoutSessionSuccess,

    verifySession,
    isVerifyingSessionPending,
    isVerifySessionError,
    isVerifySessionSuccess,

    verifyExtraSession,
    isVerifyingExtraSessionPending,
    isVerifyExtraSessionError,
    isVerifyExtraSessionSuccess,

    billingPortalSession,
    isCreatingBillingPortalSession,
    isCreateBillingPortalSessionError,
    isCreateBillingPortalSessionSuccess,

    createExtraCheckoutSession,
    isCreatingExtraCheckoutSessionPending,
    isCreateExtraCheckoutSessionError,
    isCreateExtraCheckoutSessionSuccess,
  };
};

export default useStripe;
