import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@latest";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

//helper 1: Get subscription tier details
async function getTier(supabase: any, tierId: string) {
  const { data: subscriptionTier, error: tierError } = await supabase.from("subscription_tiers").select("*").eq("id", tierId).maybeSingle();

  if (tierError) throw tierError;

  return subscriptionTier;
}

//helper 2: Check if user already has an active subscription
async function getExistingActiveSubscription(supabase: any, userId: string) {
  const { data: existingSubscription, error: fetchError } = await supabase.from("subscriptions").select("*").eq("user_id", userId).eq('status', 'active').maybeSingle();

  if (fetchError) throw fetchError;

  return !!existingSubscription
}

//helper 3: Create subscription and update tier user count
async function createSubscription(supabase: any, userId: string, subscriptionTier: any, billingCycle: string, used_coupon_on_start: boolean, coupon_id: string | null, trialEndsAt: Date) {
  const subscriptionPeriod = new Date();
  subscriptionPeriod.setFullYear(subscriptionPeriod.getFullYear() + 1);

  const { data: newSubscription, error: insertError } = await supabase.from("subscriptions").insert([
    {
      user_id: userId,
      amount: billingCycle == "Monthly" ?
        subscriptionTier.price_monthly_value : subscriptionTier.price_yearly_value,
      billing_cycle: billingCycle,
      services_allowed: subscriptionTier.allowed_services,
      auto_renew: false,
      expires_at: subscriptionPeriod.toISOString(),
      is_in_trial: true,
      trial_expires_at: trialEndsAt.toISOString(),
      tier_id: subscriptionTier.id,
      status: "active",
      next_payment_date: trialEndsAt.toISOString(),
      used_coupon_on_start: used_coupon_on_start || false,
      coupon_id: coupon_id || null,
    }
  ]).select().maybeSingle();

  if (insertError) throw insertError;

  const { error } = await supabase.from("subscription_tiers").update(
    { users: subscriptionTier.users + 1 }
  ).eq("id", subscriptionTier.id);

  if (error) throw error;

  return newSubscription;
}

//helper 4: Create transaction record for next payment
async function createTransaction(supabase: any, newSubscription: any, userId: string, billingCycle: string, trialEndsAt: Date) {
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
async function sendEmail(supabase: any, userId: string, subscriptionTier: any, finalAmount: number, newSubscription: any) {
  const { data: user, error: fetchError } = await supabase.from("profiles_with_email").select("*").eq("id", userId).maybeSingle();

  if (fetchError) throw fetchError;

  const {data, error} = await resend.emails.send({
    From: `"اهلا بك (via Khedemtak Support)" <${Deno.env.get("APP_SUPPORT_EMAIL")}>`,
    To: user?.email,
    Template: {
      Id: "new-subscription",
      Variables: {
        name: user?.full_name || 'مستخدم',
        product_name: Deno.env.get("APP_NAME"),
        help_url: Deno.env.get("APP_HELP_URL"),
        total: finalAmount,
        due_date: new Date(newSubscription.next_payment_date).toLocaleDateString(),
        coupon_used: newSubscription.used_coupon_on_start ? 'نعم' : 'لا',
      }
    }
  });

  if (error) {
    throw new Error(error);
  }

  return data;
}

// Main function to handle the request
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { user_id, subscription_tier_id, billing_cycle, used_coupon_on_start, coupon_id, final_amount }: { user_id: string, subscription_tier_id: string, billing_cycle: string, used_coupon_on_start: boolean, coupon_id: string | null, final_amount: number } = await req.json();

    const subscriptionTier = await getTier(supabase, subscription_tier_id);

    if (await getExistingActiveSubscription(supabase, user_id)) {
      return new Response(
        JSON.stringify({ success: false, message: "User already has an active subscription" }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 400 }
      );
    }

    const trialEndsAt = new Date();
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 3);

    const newSubscription = await createSubscription(supabase, user_id, subscriptionTier, billing_cycle, used_coupon_on_start, coupon_id, trialEndsAt);

    if (!(await createTransaction(supabase, newSubscription, user_id, billing_cycle, trialEndsAt))) {
      return new Response(
        JSON.stringify({ success: false, message: "Error creating subscription transaction" }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 500 }
      );
    }

    if (await sendEmail(supabase, user_id, subscriptionTier, final_amount, newSubscription) !== "OK") {
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
