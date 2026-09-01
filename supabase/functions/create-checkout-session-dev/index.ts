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

async function getCustomerIdFromDB(user_id: string) {
  const { data: { stripe_customer_id, full_name }, error: customerError } = await supabase.from("profiles").select("*").eq("id", user_id).maybeSingle();

  if (customerError) {
    console.log(customerError);

    return {
      customerId: null,
      name: null
    };
  }

  return {
    customerId: stripe_customer_id,
    name: full_name
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
    const { priceId, userId, email, subscriptionTierId } = await req.json();

    if (!email || email.length < 3) {
      return new Response(
      JSON.stringify({
        success: false,
        error: "no_email",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
    }

    let { customerId, name } = await getCustomerIdFromDB(userId);

    if (!name) {
      return new Response(
      JSON.stringify({
        success: false,
        error: "no_name",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        name,
        email,
        metadata: {
          userId
        }
      });
      
      customerId = customer.id;

      const { error } = await supabase.from("profiles").update({
        stripe_customer_id: customerId
      }).eq("id", userId);

      if (error) {
        console.log(error);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: "http://localhost:8080/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:8080/payment-failed",
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        email: email,
        subscription_tier_id: subscriptionTierId
      },
      subscription_data: {
        trial_period_days: 120,
        metadata: {
          user_id: userId,
          email: email,
          subscription_tier_id: subscriptionTierId
        }
      },
      payment_method_collection: "if_required"
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-checkout-session' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
