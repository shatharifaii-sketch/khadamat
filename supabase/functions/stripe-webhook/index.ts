// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SEC_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

let invoiceId: string;

async function handleInvoiceCreated(invoice: any) {
  try {
    console.log('creating invoice in database');
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        amount: invoice.amount_due,
        stripe_invoice_id: invoice.id,
        status: invoice.status,
        subtotal: invoice.subtotal,
        url: invoice.invoice_pdf,
        stripe_price_id: invoice.lines.data[0].pricing.price_details.price,
        stripe_product_id: invoice.lines.data[0].pricing.price_details.product,
        stripe_subscription_id: invoice.lines.data[0].parent.subscription_item_details.subscription,
        stripe_subscription_item_id: invoice.lines.data[0].parent.subscription_item_details.subscription_item,
        stripe_customer_id: invoice.customer,
        billing_reason: invoice.billing_reason
      })
      .select('*')
      .maybeSingle();

    if (error) {
      console.log('Error creating invoice in database: ', error);
      return false;
    };

    console.log('invoice created in database: ', data);

    invoiceId = data.id

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    console.log("Checkout session completed:", session, invoiceId);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: session.customer
      })
      .eq('id', session.client_reference_id)
      .select('id');

    if (profileError) {
      console.log('checkout session profile error: ', profileError);

      return false;
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        user_id: session.client_reference_id,
      })
      .eq('stripe_invoice_id', session.invoice)
      .select()

    if (invoiceError) {
      console.log('checkout session invoice error: ', invoiceError);

      return false;
    }

    return true;
  } catch (error) {
    console.log('checkout session error: ', error);
    return false;
  }
}

async function handleInvoicePaymentPaid(invoice: any) {
  return;
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('subscription created: ', subscription);

    const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .maybeSingle();
  
  if (profileError) {
    console.log('subscription creation PROFILE error: ', profileError);
    return false;
  };

  const { data: subscriptionTier, error: tierError } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq(
      'stripe_product_id', 
      subscription.items.data[0].plan.product
    )
    .maybeSingle();

  if (tierError) {
    console.log('subscription creation TIER error: ', tierError);
    return false;
  };

  const subscriptionStart = new Date(subscription.items.data[0].created * 1000);
  const lastPaymentDate = new Date(subscription.items.data[0].current_period_start * 1000);
  const nextPaymentDate = new Date(subscription.items.data[0].current_period_end * 1000);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: profile.id,
      tier_id: subscriptionTier.id,
      currency: subscription.currency,
      billing_cycle: subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly',
      started_at: subscriptionStart,
      last_payment_date: lastPaymentDate,
      next_payment_date: nextPaymentDate,
      amount: subscription.items.data[0].plan.amount / 100,
      status: subscription.items.data[0].plan.active ? 'active' : 'inactive',
      stripe_subscription_id: subscription.id,
      stripe_subscription_item_id: subscription.items.data[0].id,
      stripe_customer_id: subscription.customer,
      stripe_product_id: subscription.items.data[0].plan.product,
      stripe_price_id: subscription.items.data[0].price.id,
    })
    .select('user_id, tier_id, billing_cycle')
    .maybeSingle();

  if (error) {
    console.log('subscription creation error: ', error);
    return false;
  };

  return true;
  } catch (error) {
    console.log('subscription creation error: ', error);
    return false;
  }
}

async function handleCustomerCreated(customer: any) {
  try {
    console.log('customer created: ', customer);

    const { data: profileId, error: profileIdError } = await supabase
    .from('profiles_with_email')
    .select('id')
    .eq('email', customer.email)
    .maybeSingle();

    if (profileIdError) {
      console.log('customer creation PROFILE error: ', profileIdError);
      return false;
    };

    const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customer.id
    })
    .eq('id', profileId.id)
    .select('id');

    if (profileError) {
      console.log('customer creation PROFILE error: ', profileError);
      return false;
    };

    return true;
  } catch (error) {
    console.log('customer creation error: ', error);
    return false;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};


Deno.serve(async (req: Request) => {
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

  const body = await req.text();
  let data;
  let eventType;

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  console.log("wh sec: ", webhookSecret);

  if (webhookSecret) {
    let event;
    let signature = req.headers.get("stripe-signature");
    console.log("sign: ", signature);

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature!,
        webhookSecret
      );

      data = event.data;
      eventType = event.type;

    } catch (error) {
      return new Response(`Webhook error: ${error.message}`, {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      })
    }
  }

  console.log("Received event:", eventType);
  console.log(data);

  switch (eventType) {
    case 'checkout.session.completed':
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      const checkoutResponse = await handleCheckoutSessionCompleted(
        data.object
      );

      if (!checkoutResponse) {
        return new Response("Error creating invoice", {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      break;
    case 'invoice.created':
      console.log(data.object)
      const createInvoiceResponse = await handleInvoiceCreated(
        data.object,
      );

      if (!createInvoiceResponse) {
        return new Response("Error creating invoice", {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      break;
    case 'invoice_payment.paid':
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      await handleInvoicePaymentPaid(
        data.object
      )

      break;
    case 'invoice.payment_failed':
      // The payment failed or the customer doesn't have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      break;
    case 'customer.subscription.created':
      const createSubResponse = await handleSubscriptionCreated(
        data.object
      );

      if (!createSubResponse) {
        return new Response("Error creating invoice", {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      break;
    case 'customer.created':
      const createCustomerResponse = await handleCustomerCreated(
        data.object
      )

      if (!createCustomerResponse) {
        return new Response("Error creating invoice", {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      break;
    case 'customer.subscription.trial_will_end':

      break;
    case 'customer.subscription.updated':

      break;
    case 'customer.subscription.deleted':

      break;
  }

  return new Response("ok", {
    status: 200,
    headers: corsHeaders,
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/checkout-session-stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
