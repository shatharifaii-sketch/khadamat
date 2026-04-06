// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_LIVE_SEC_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { formData } = await req.json();

    const percent = formData.discount_percentage ? Number(formData.discount_percentage) : null;

    const amount = formData.discount_amount ? Number(formData.discount_amount) : null;

    if (!percent && !amount) {
      throw new Error('Discount percentage or amount is required.');
    }

    if (percent && amount) {
      throw new Error('Only one of discount percentage or amount is allowed.');
    }

    const couponPayload: any = {
      duration: 'once',
      max_redemptions: formData.usage_limit || 1,
    }

    if (percent) {
      couponPayload.percent_off = percent;
    }

    if (amount) {
      couponPayload.amount_off = amount;
      couponPayload.currency = 'ils';
    }

    if (formData.expires_at) {
      couponPayload.redeem_by = Math.floor(
        new Date(formData.expires_at).getTime() / 1000
      );
    }

    const couponResponse = await stripe.coupons.create(couponPayload);

    const promotionCodeResponse = await stripe.promotionCodes.create({
      promotion: {
        type: 'coupon',
        coupon: couponResponse.id
      },
      code: formData.code.trim().toUpperCase() || '',
      max_redemptions: formData.usage_limit || 1,
    });

    return new Response(
      JSON.stringify({
        success: true,
        coupon: couponResponse,
        promotionCode: promotionCodeResponse,
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200
    })
  } catch (error) {
    console.error("Checkout error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-coupons-with-stripe' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
