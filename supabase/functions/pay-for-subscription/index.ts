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

    const { subscriptionData, currency, total } = await req.json();

    let coupon = null;
    let finalAmount = total;

    if (!subscriptionData.last_payment_date && subscriptionData.used_coupon_on_start && subscriptionData.coupon_id) {
      const { data, error: couponError } = await supabase
        .from('coupons')
        .update({ valid: false })
        .select('*')
        .eq('id', subscriptionData.coupon_id)
        .eq('valid', true)
        .maybeSingle();

      if (couponError) throw couponError;

      coupon = data;

      if (coupon.type === 'percentage') {
        finalAmount = total - (total * (coupon.discount_percentage / 100));
      } else {
        finalAmount = total - coupon.discount_amount;
      }
    }

    const tokenResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/billPs-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
      }
    })

    if (!tokenResponse.ok) {
      console.log('Error getting payment url:', tokenResponse);
      return new Response("Error getting token", { status: 500, headers: corsHeaders });
    }

    const data = await tokenResponse.json();

    const params = new URLSearchParams({
      token: data.token,
      api_data: Deno.env.get('BILLPS_APP_DATA')!,
      total: Math.max(0, 4).toString(),
      currency: 'ILS',
      return_url: Deno.env.get('BILLPS_RETURN_URL_DEV')!,
      inv_details: JSON.stringify(subscriptionData),
      invoice_id: crypto.randomUUID(),
    });

    const url = `${Deno.env.get("BILLPS_HOST_URL")}api/saveInvoice?${params.toString()}`;

    const paymentUrlResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
      }
    });

    if (!paymentUrlResponse.ok) {
      console.log('Error creating payment url:', paymentUrlResponse);
      return new Response("Error creating payment url", { status: 500, headers: corsHeaders });
    }

    const paymentData = await paymentUrlResponse.json();

    return new Response(JSON.stringify({
      success: true,
      paymentUrl: paymentData.data.pay_url
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200
    });

  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message
    }), {
      headers: corsHeaders,
      status: 500
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/pay-for-subscription' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
