// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

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

    const { user_id, subscription_tier_id, billing_cycle } = await req.json();

    const { data: subscriptionTier, error: tierError } = await supabase.from("subscription_tiers").select("*").eq("id", subscription_tier_id).maybeSingle();

    if (tierError) throw tierError;

    const { data: existingSubscription, error: fetchError } = await supabase.from("subscriptions").select("*").eq("user_id", user_id).eq('status', 'active').maybeSingle();

    if (fetchError) throw fetchError;

    if (existingSubscription) {
      return new Response(
        JSON.stringify({ success: false, message: "User already has an active subscription" }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 400 }
      );
    }

    const trialEndsAt = new Date();
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 3);

    const subscriptionPeriod = new Date();
    subscriptionPeriod.setFullYear(subscriptionPeriod.getFullYear() + 1);

    const { data: newSubscription, error: insertError } = await supabase.from("subscriptions").insert([
      {
        user_id,
        amount: billing_cycle == "Monthly" ?
          subscriptionTier.price_monthly_value : subscriptionTier.price_yearly_value,
        billing_cycle,
        services_allowed: subscriptionTier.allowed_services,
        auto_renew: false,
        expires_at: subscriptionPeriod.toISOString(),
        is_in_trial: true,
        trial_expires_at: trialEndsAt.toISOString(),
        tier_id: subscriptionTier.id,
        status: "active",
        next_payment_date: trialEndsAt.toISOString()
      }
    ]).select().maybeSingle();

    if (insertError) throw insertError;

    const { error } = await supabase.from("subscription_tiers").update(
      { users: subscriptionTier.users + 1 }
    ).eq("id", subscription_tier_id);

    if (error) throw error;

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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-subscription' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
