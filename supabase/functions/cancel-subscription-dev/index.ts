// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe";
import { Resend } from "npm:resend@latest";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
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

function formatDate(date?: string | Date | null) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

async function deactivateSubInSupabase(id: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'inactive',
      subscription_ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.log(error);
    return {
      error,
      success: false
    };
  }

  return {
    data,
    success: true
  };
}

async function cancelStripeSubscription(stripe_sub_id: string) {
  try {
    await stripe.subscriptions.cancel(stripe_sub_id);

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error
    };
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
    const { sub_id, email, name, stripe_sub_id } = await req.json();

    const res = await deactivateSubInSupabase(sub_id);

    if (!res.success) {
      console.error("subscription deactivation on supabase error");

      return new Response(
        JSON.stringify({
          success: false,
          error: res.error
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

    const response = await cancelStripeSubscription(stripe_sub_id);

    if (!response.success) {
      console.error("subscription deactivation on supabase error");

      return new Response(
        JSON.stringify({
          success: false,
          error: response.error
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

    const { data, error } = await resend.emails.send({
      from: "Khedemtak <support@mail.khedemtak.com>",
      to: email,
      template: {
        id: "subscription-cancel",
        variables: {
          name: name ?? 'مستخدم',
          subscription_date: formatDate(res.data.started_at),
          last_payment_date: formatDate(res.data.last_payment_date),
          subscription_cancel_date: formatDate(res.data.ended_at),
          help_url: Deno.env.get('APP_HELP_URL'),
        }
      }
    })

    if (error) {
      console.log('Error sending email: ', error);

      return new Response(
        JSON.stringify({
          success: false,
          error: error
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

    return new Response(
      JSON.stringify({
        success: true,
        error: null
      }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
    )
  } catch (error) {
    console.error("subscription cancellation error:", error);

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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/cancel-subscription' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
