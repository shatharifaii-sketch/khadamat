import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@latest";
import Stripe from "npm:stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SEC_KEY")!);
const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function formatDate(date?: string | Date | null) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

async function getCustomerIdFromDB(user_id: string) {
  const { data: { stripe_customer_id }, error: customerError } = await supabase.from("profiles").select("*").eq("id", user_id).maybeSingle();

  if (customerError) {
    console.log(customerError);

    return null;
  }

  return stripe_customer_id
}

//helper 1: Get subscription tier details
async function getTier(tierId: string) {
  const { data: subscriptionTier, error: tierError } = await supabase.from("subscription_tiers").select("*").eq("id", tierId).maybeSingle();

  if (tierError) throw tierError;

  return subscriptionTier;
}

//helper 2: Check if user already has an active subscription
async function getExistingActiveSubscription(userId: string) {
  const { data: existingSubscription, error: fetchError } = await supabase.from("subscriptions_dev").select("*").eq("user_id", userId).eq('status', 'active').maybeSingle();

  if (fetchError) throw fetchError;

  return !!existingSubscription
}

//helper 3: Create subscription and update tier user count
async function createSubscription(userId: string, subscriptionTier: any, billingCycle: string, trialEndsAt: Date, customerId: string) {
  const subscriptionPeriod = new Date();
  subscriptionPeriod.setFullYear(subscriptionPeriod.getFullYear() + 1);

  const { data: newSubscription, error: insertError } = await supabase.from("subscriptions_dev").insert([
    {
      user_id: userId,
      amount: billingCycle == "Monthly" 
          ? subscriptionTier.price_monthly_value 
          : subscriptionTier.price_yearly_value,
      billing_cycle: billingCycle,
      services_allowed: subscriptionTier.allowed_services,
      auto_renew: false,
      expires_at: subscriptionPeriod.toISOString(),
      is_in_trial: true,
      trial_expires_at: trialEndsAt.toISOString(),
      tier_id: subscriptionTier.id,
      status: "active",
      next_payment_date: trialEndsAt.toISOString(),
      currency: "ils",
      stripe_customer_id: customerId
    }
  ]).select().maybeSingle();

  if (insertError) throw insertError;

  const { error } = await supabase.from("subscription_tiers_dev").update(
    { users: subscriptionTier.users + 1 }
  ).eq("id", subscriptionTier.id);

  if (error) throw error;

  return newSubscription;
}

//helper 4: Create transaction record for next payment
async function createTransaction(newSubscription: any, userId: string, billingCycle: string, trialEndsAt: Date) {
  const billingPeriodStart = new Date(trialEndsAt);
  const billingPeriodEnd = new Date(billingPeriodStart);
  billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + (billingCycle === 'Monthly' ? 1 : 12));

  const { error: transactionError } = await supabase.from("subscription_transactions").insert({
    user_id: userId,
    subscription_id: newSubscription.id,
    amount: newSubscription.amount,
    billing_period_start: billingPeriodStart.toISOString(),
    billing_period_end: billingPeriodEnd.toISOString(),
    payment_status: 'pending',
    currency: newSubscription.currency,
    coupon_id: newSubscription.coupon_id || null,
    coupon_used: newSubscription.used_coupon_on_start || false
  })

  if (transactionError) {
    const { error: deleteError } = await supabase.from("subscriptions").delete().eq("id", newSubscription.id);
    if (deleteError) throw deleteError;
    throw transactionError;
  };

  return true;
}

//helper 5: Send welcome email to user
async function sendEmail(userId: string, subscriptionTier: any, finalAmount: number, newSubscription: any) {
  const { data: user, error: fetchError } = await supabase.from("profiles_with_email").select("*").eq("id", userId).single();
  

  if (fetchError) {
    throw fetchError
  };

  const { error: resendError } = await resend.emails.send({
      from: "Khedemtak <support@mail.khedemtak.com>",
      to: user?.email,
      template: {
        id: "subscription-created",
        variables: {
          name: user?.full_name ?? 'مستخدم',
          tier: subscriptionTier.title,
          free_trial_period: subscriptionTier.free_trial_period_text,
          billing_cycle: subscriptionTier.billing_cycle === 'yearly' ? 'سنوي' : 'شهري',
          subscription_date: formatDate(newSubscription.created_at),
          due_date: formatDate(newSubscription.trial_expires_at),
          first_payment_date: formatDate(newSubscription.trial_expires_at),
          total: finalAmount.toString(),
          action_link: Deno.env.get('APP_ACCOUNT_PAGE_LIVE'),
          help_url: Deno.env.get('APP_HELP_URL_LIVE'),
        }
      }
    });

  if (resendError) {
    throw new Error(resendError);
  }

  return true;
}

// Main function to handle the request
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { user_id, user_email, subscription_tier_id, billing_cycle, final_amount }: { user_id: string, user_email: string, subscription_tier_id: string, billing_cycle: string, final_amount: number } = await req.json();

    let customerId = await getCustomerIdFromDB(user_id);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user_email,
        metadata: {
          user_id
        }
      });
      
      customerId = customer.id;
    }

    const subscriptionTier = await getTier(subscription_tier_id);

    if (await getExistingActiveSubscription(user_id)) {
      return new Response(
        JSON.stringify({ success: false, message: "User already has an active subscription" }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 400 }
      );
    }

    const trialEndsAt = new Date();
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 4);

    const newSubscription = await createSubscription(user_id, subscriptionTier, billing_cycle, trialEndsAt, customerId);

    // if (!(await createTransaction(newSubscription, user_id, billing_cycle, trialEndsAt))) {
    //   return new Response(
    //     JSON.stringify({ success: false, message: "Error creating subscription transaction" }),
    //     { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 500 }
    //   );
    // }

    if (!(await sendEmail(user_id, subscriptionTier, final_amount, newSubscription))) {
      return new Response(
        JSON.stringify({ success: false, message: "Error sending welcome email" }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 500 }
      );
    }


    return new Response(JSON.stringify({ success: true, subscription: newSubscription }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200
    })
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ success: false, error: err }), {
      headers: corsHeaders,
      status: 400
    })
  }
})
