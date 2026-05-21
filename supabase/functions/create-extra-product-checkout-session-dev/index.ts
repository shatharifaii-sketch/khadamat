// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SEC_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getStripeData(name: string, user_id: string) {
  const { data: { stripe_price_id, stripe_product_id }, error: productError } = await supabase.from("extra_products").select("stripe_price_id, stripe_product_id").eq("name", name).maybeSingle();

  if (productError) {
    console.log(productError);

    return {
      priceId: null,
      stripeCustomerId: null,
      productId: null
    }
  }

  const { data: { stripe_customer_id }, error: customerError } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user_id).maybeSingle();

  if (customerError) {
    console.log(customerError);

    return {
      priceId: null,
      stripeCustomerId: null,
      productId: null
    }
  }

  if (!stripe_price_id || !stripe_product_id || !stripe_customer_id) {
    console.log("missing stripe data", stripe_price_id, stripe_product_id, stripe_customer_id);

    return {
      priceId: null,
      stripeCustomerId: null,
      productId: null
    }
  }

  return {
    priceId: stripe_price_id,
    stripeCustomerId: stripe_customer_id,
    productId: stripe_product_id
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
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
    const { userId, email, name } = await req.json();

    if (!userId || !email || !name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
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

    const { priceId, stripeCustomerId, productId } = await getStripeData(name, userId);

    if (!priceId || !stripeCustomerId || !productId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing Stripe data",
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


    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: "http://localhost:8080/extra-payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:8080/payment-failed",
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        customer_id: stripeCustomerId,
        email: email,
        subscription_tier_id: productId
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        sessionUrl: session.url,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
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
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-extra-product-checkout-session-dev' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
