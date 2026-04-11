// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe";
import { Resend } from "npm:resend@latest";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SEC_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function formatDate(date?: string | Date | null) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

async function checkDiscount(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['discounts']
    });

    console.log('subscription: ', subscription);

    const discount = subscription.discounts[0];

    console.log('discount: ', discount);

    if (!discount) return null;

    const { data, error } = await supabase
        .from('coupons')
        .select('id')
        .eq('stripe_coupon_id', discount.source.coupon)
        .eq('stripe_promo_id', discount.promotion_code)
        .maybeSingle();
    
    if (error) {
      console.log('discount fetch error: ', error);
      return null;
    }

    return {
      discount_id: discount.id,
      coupon_id: discount.source.coupon ?? null,
      promotion_code_id: discount.promotion_code ?? null,
      db_id: data?.id ?? null,
    }
  } catch (error) {
    console.log('discount fetch error: ', error);
    return null;
  }
}

async function deactivateSub(stripe_sub_id: string, endedAt: Date) {
  try {
    const { data: existingSub, error: subError } = await supabase.from('subscriptions_dev').select('id, status').eq('stripe_subscription_id', stripe_sub_id).maybeSingle();

    if (subError) {
      console.log('subscription fetch SUB error: ', subError);
      return false;
    }

    if (!existingSub) {
      console.log('No subscription found with stripe_subscription_id: ', stripe_sub_id);
      return true;
    }

    if (existingSub.status === 'inactive') {
      console.log('Subscription already inactive for stripe_subscription_id: ', stripe_sub_id);
      return true;
    }

    const { error: updateError } = await supabase.from('subscriptions_dev').update({
      status: 'inactive',
      subscription_ended_at: endedAt.toISOString(),
    }).eq('stripe_subscription_id', stripe_sub_id);

    if (updateError) {
      console.log('subscription creation SUB error: ', updateError);
      return false;
    };

    return true;
  } catch (error) {
    console.log('Error deactivating subscription: ', error);
    return false;
  }
}

async function getSubscriptionWithRetry(retries: number, delay: number, subscriptionId: string, userId: string) {
  for (let i = 0; i < retries; i++) {
    const { data } = await supabase.from('subscriptions_dev').select('id').eq('stripe_subscription_id', subscriptionId).eq('user_id', userId).maybeSingle();

    if (data) return data;

    await new Promise((res) => setTimeout(res, delay));
  }

  return null;
}


async function handleInvoiceCreated(invoice: any) {
  try {
    console.log('creating invoice in database');
    const { data, error } = await supabase
      .from('invoices_dev')
      .insert({
        user_id: invoice.lines.data[0].metadata.user_id,
        amount: invoice.amount_due / 100,
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
    };

    // const { data: resendData, error: resendError } = await resend.emails.send({
    //   from: "Khedemtak <support@mail.khedemtak.com>",
    //   to: invoice.lines.data[0].metadata.email,
    //   template: {
    //     id: "invoice-created",
    //     variables: {
    //       name: invoice.customer_name,
    //       total: (invoice.amount_due / 100).toString(),
    //       action_link: invoice.hosted_invoice_url,
    //       help_url: Deno.env.get("APP_HELP_URL_LIVE"),//Deno.env.get("APP_HELP_URL"),
    //     },
    //   }
    // })

    // if (resendError) {
    //   console.log('Error sending invoice email: ', resendError);
    //   return false;
    // }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
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

    const { error: invoiceError } = await supabase
      .from('invoices_dev')
      .update({
        user_id: session.client_reference_id,
      })
      .eq('stripe_invoice_id', session.invoice)

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
  try {
    const userId = invoice.lines.data[0].metadata.user_id;
    const subscriptionId = invoice.lines.data[0].parent.subscription_item_details.subscription;

    // --- 1. UPSERT INVOICE (idempotent, removes dependency on invoice.created)
    const { data: inv, error: invoiceUpsertError } = await supabase
      .from('invoices_dev')
      .upsert(
        {
          user_id: userId,
          stripe_invoice_id: invoice.id,
          status: invoice.status,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          url: invoice.invoice_pdf,
          stripe_customer_id: invoice.customer,
          billing_reason: invoice.billing_reason,
        },
        { onConflict: 'stripe_invoice_id' }
      )
      .select('*')
      .maybeSingle();

    if (invoiceUpsertError || !inv) {
      console.log('invoice upsert error:', invoiceUpsertError);
      return false;
    }

    // --- 2. RETRY FETCH SUBSCRIPTION (handles race condition)
    const sub = await getSubscriptionWithRetry(5, 500, subscriptionId, userId);

    const subscriptionDbId = sub?.id ?? null;

    // --- 3. PREPARE DATES SAFELY
    const paymentDate = new Date(invoice.status_transitions.paid_at * 1000);
    const billingStart = new Date(invoice.lines.data[0].period.start * 1000);
    const billingEnd = new Date(invoice.lines.data[0].period.end * 1000);

    // --- 4. UPSERT TRANSACTION (prevents duplicates)
    const { data, error: transactionError } = await supabase
      .from('subscription_transactions_dev')
      .upsert({
        user_id: invoice.lines.data[0].metadata.user_id,
        invoice_id: inv.id,
        subscription_id: subscriptionDbId,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        payment_date: paymentDate.toISOString(),
        payment_status: 'paid',
        billing_period_start: billingStart.toISOString(),
        billing_period_end: billingEnd.toISOString(),
        invoice_url: invoice.invoice_pdf,
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: subscriptionId,
        stripe_subscription_item_id: invoice.lines.data[0].parent.subscription_item_details.subscription_item,
        stripe_price_id: invoice.lines.data[0].pricing.price_details.price,
        stripe_product_id: invoice.lines.data[0].pricing.price_details.product,
        stripe_customer_id: invoice.customer,
        billing_reason: invoice.billing_reason
      },
        { onConflict: 'stripe_invoice_id' }
      )
      .select('id, created_at')
      .maybeSingle();

    if (transactionError || !data) {
      console.log('invoice payment transaction error: ', transactionError);
      return false;
    }

    const { error: invoiceUpdateError } = await supabase.from('invoices_dev').update({
      subscription_transaction_id: data.id
    }).eq('id', inv.id);

    if (invoiceUpdateError) {
      console.log('subscription transaction INVOICE update error: ', invoiceUpdateError);
      return false;
    };

    // --- 6. PREVENT DUPLICATE EMAILS
    const { data: existingTx } = await supabase
      .from('subscription_transactions_dev')
      .select('id, email_sent')
      .eq('stripe_invoice_id', invoice.id)
      .maybeSingle();

    if (existingTx?.email_sent) {
      return true;
    }

    const { error: resendError } = await resend.emails.send({
      from: "Khedemtak <support@mail.khedemtak.com>",
      to: invoice.lines.data[0].metadata.email,
      template: {
        id: "payment-confirmation",
        variables: {
          name: invoice.customer_name,
          total: (invoice.amount_paid / 100).toString(),
          subscription_date: formatDate(billingStart),
          invoice_url: invoice.hosted_invoice_url,
          due_date: formatDate(billingEnd),
          action_link: Deno.env.get('APP_ACCOUNT_PAGE'),
          help_url: Deno.env.get('APP_HELP_URL'),
        }
      }
    });

    if (resendError) {
      console.log('invoice payment resend error: ', resendError);
      return false;
    }

    await supabase.from('subscription_transactions_dev').update({ email_sent: true }).eq('id', data.id);

    return true;
  } catch (error) {
    console.log('error with invoice payment: ', error);
    return false;
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    const discount = await checkDiscount(subscription.id);

    console.log('handle function subscription created - discount: ', discount);

    const { data: subscriptionTier, error: tierError } = await supabase
      .from('subscription_tiers_dev')
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
    const paymentsStart = new Date(subscription.items.data[0].current_period_start * 1000);
    const nextPaymentDate = new Date(subscription.items.data[0].current_period_end * 1000);

    const { data, error } = await supabase
      .from('subscriptions_dev')
      .upsert({
        user_id: subscription.metadata.user_id,
        tier_id: subscriptionTier.id,
        currency: subscription.currency,
        billing_cycle: subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly',
        started_at: subscriptionStart,
        last_payment_date: paymentsStart,
        next_payment_date: nextPaymentDate,
        expires_at: nextPaymentDate,
        amount: subscription.items.data[0].plan.amount / 100,
        status: subscription.items.data[0].plan.active ? 'active' : 'inactive',
        trial_expires_at: nextPaymentDate,
        used_coupon_on_start: !!discount,
        coupon_id: discount?.db_id ?? null,
        stripe_subscription_id: subscription.id,
        stripe_subscription_item_id: subscription.items.data[0].id,
        stripe_customer_id: subscription.customer,
        stripe_product_id: subscription.items.data[0].plan.product,
        stripe_price_id: subscription.items.data[0].price.id,
        latest_stripe_invoice_id: subscription.latest_invoice,
        stripe_discount_id: discount?.discount_id ?? null,
        stripe_coupon_id: discount?.coupon_id ?? null,
        stripe_promotion_id: discount?.promotion_code_id ?? null
      },
        {
          onConflict: 'stripe_subscription_id'
        }
      )
      .select('id, user_id, tier_id, billing_cycle')
      .maybeSingle();

    if (error) {
      console.log('subscription creation error: ', error);
      return false;
    };

    const { error: invoiceError } = await supabase.from('invoices_dev').update({
      subscription_id: data.id
    }).eq('user_id', subscription.metadata.user_id).eq('stripe_invoice_id', subscription.latest_invoice);

    if (invoiceError) {
      console.log('subscription creation INVOICE error: ', invoiceError);
      return false;
    };

    const { data: userData, error: userDataError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', subscription.metadata.user_id)
      .maybeSingle();

    if (userDataError) {
      console.log('subscription creation USER error: ', userDataError);
    };

    const { error: resendError } = await resend.emails.send({
      from: "Khedemtak <support@mail.khedemtak.com>",
      to: subscription.metadata.email,
      template: {
        id: "subscription-created",
        variables: {
          name: userData.full_name ?? 'مستخدم',
          tier: subscriptionTier.title,
          free_trial_period: subscriptionTier.free_trial_period_text,
          billing_cycle: subscriptionTier.billing_cycle === 'yearly' ? 'سنوي' : 'شهري',
          subscription_date: formatDate(subscriptionStart),
          due_date: formatDate(nextPaymentDate),
          first_payment_date: formatDate(paymentsStart),
          total: (subscription.items.data[0].plan.amount / 100).toString(),
          action_link: Deno.env.get('APP_ACCOUNT_PAGE'),
          help_url: Deno.env.get('APP_HELP_URL'),
        }
      }
    });

    if (resendError) {
      console.log('subscription creation resend error: ', resendError);
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
    const { data: profileId, error: profileIdError } = await supabase
      .from('profiles_with_email')
      .select('id')
      .eq('email', customer.email)
      .maybeSingle();

    if (profileIdError) {
      console.log('customer creation PROFILE error: ', profileIdError);
      return false;
    };

    const { error: profileError } = await supabase
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

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const { data, error } = await supabase
      .from('invoices_dev')
      .update({
        status: invoice.status,
        url: invoice.invoice_pdf,
      })
      .select('id, user_id')
      .eq('stripe_invoice_id', invoice.id)
      .maybeSingle();

    if (error) {
      console.log('Error creating invoice in database: ', error);
      return false;
    };

    const { data: userData, error: userDataError } = await supabase.from('profiles_with_email').select('full_name, email').eq('id', data.user_id).maybeSingle();

    if (userDataError) {
      console.log('invoice payment failed USER error: ', userDataError);
      return false;
    }

    const { data: subscriptionData, error: subscriptionError } = 
    await supabase.from('subscriptions_dev')
                  .select('started_at')
                  .eq('user_id', data.user_id)
                  .eq('status', 'active')
                  .maybeSingle();

    if (subscriptionError) {
      console.log('invoice payment failed SUB error: ', subscriptionError);
      return false;
    }

    const { error: resendError } = await resend.emails.send({
        from: "Khedemtak <support@mail.khedemtak.com>",
        to: userData.email,
        template: {
          id: "payment-failed",
          variables: {
            name: userData.full_name ?? 'مستخدم',
            total: (invoice.amount_due / 100).toString(),
            subscription_date: formatDate(subscriptionData.started_at),
            invoice_url: invoice.hosted_invoice_url,
            help_url: Deno.env.get('APP_HELP_URL'),
          }
        }
      });

      if (resendError) {
        console.log('subscription creation resend error: ', resendError);
        return false;
      };

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const { data: userData, error: userDataError } = await supabase.from('profiles')
      .select('full_name')
      .eq('id', subscription.metadata.user_id)
      .maybeSingle();

    if (userDataError) {
      console.log('subscription update USER error: ', userDataError);
    };

    const subscriptionStart = new Date(subscription.items.data[0].created * 1000);
    const paymentsStart = new Date(subscription.items.data[0].current_period_start * 1000);
    const endedAt = new Date(subscription.ended_at * 1000);

    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      const deactivateResponse = await deactivateSub(
        subscription.id,
        endedAt
      );

      if (!deactivateResponse) {
        return false;
      };
    }

    if (subscription.status === 'canceled') {
      const { error: resendError } = await resend.emails.send({
        from: "Khedemtak <support@mail.khedemtak.com>",
        to: subscription.metadata.email,
        template: {
          id: "subscription-canceled",
          variables: {
            name: userData.full_name ?? 'مستخدم',
            subscription_date: formatDate(subscriptionStart),
            last_payment_date: formatDate(paymentsStart),
            subscription_cancel_date: formatDate(endedAt),
            help_url: Deno.env.get('APP_HELP_URL'),
          }
        }
      });

      if (resendError) {
        console.log('subscription creation resend error: ', resendError);
        return false;
      };
    }
  } catch (error) {
    console.log('subscription update error: ', error);
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

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
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

  switch (eventType) {
    case 'checkout.session.completed':
      const { data: checkoutCompletedEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (checkoutCompletedEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      const checkoutResponse = await handleCheckoutSessionCompleted(
        data.object
      );

      if (!checkoutResponse) {
        return new Response("Error in checkout.session.completed: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'checkout.session.completed',
      });

      break;
    case 'invoice.created':
      const { data: invoiceCreatedEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (invoiceCreatedEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      const { data: existingInv, error: invError } = await supabase
        .from('invoices_dev')
        .select('*')
        .eq('status', 'paid')
        .eq('stripe_invoice_id', data.object.id)
        .eq('user_id', data.object.lines.data[0].metadata.user_id)
        .maybeSingle();

      if (invError) {
        console.log('invoice creation error: ', invError);
        return new Response("Error in invoice.created: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      if (existingInv) {
        return new Response("Invoice already exists and active: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      const createInvoiceResponse = await handleInvoiceCreated(
        data.object,
      );

      if (!createInvoiceResponse) {
        return new Response("Error in invoice.created: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'invoice.created',
      });

      break;
    case 'invoice.paid':
      const { data: paidEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (paidEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      const invoicePaidResponse = await handleInvoicePaymentPaid(
        data.object
      )

      if (!invoicePaidResponse) {
        return new Response("Error in invoice_payment.paid: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'invoice.paid',
      });

      break;
    case 'invoice.payment_failed':
      console.log('Payment failed for invoice: ', data.object);
      const { data: paymentFailedEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (paymentFailedEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };
      // The payment failed or the customer doesn't have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      const invoicePaymentFailedResponse = await handleInvoicePaymentFailed(
        data.object
      )

      if (!invoicePaymentFailedResponse) {
        return new Response("Error in invoice.payment_failed: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'invoice.payment_failed',
      });

      break;
    case 'customer.subscription.created':
      const { data: subCreatedEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (subCreatedEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      const { data: existingSub, error: subError } = await supabase
        .from('subscriptions_dev')
        .select('*')
        .eq('status', 'active')
        .or(
          `stripe_subscription_id.eq.${data.object.id},user_id.eq.${data.object.metadata.user_id}`
        )
        .maybeSingle();

      if (subError) {
        console.log('subscription creation SUB error: ', subError);
        return new Response("Error in customer.subscription.created: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      if (existingSub) {
        return new Response("Subscription already exists and active: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      const createSubResponse = await handleSubscriptionCreated(
        data.object
      );

      if (!createSubResponse) {
        return new Response("Error in customer.subscription.created: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'customer.subscription.created',
      });

      break;
    case 'customer.created':
      const { data: customerCreatedEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (customerCreatedEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      const createCustomerResponse = await handleCustomerCreated(
        data.object
      )

      if (!createCustomerResponse) {
        return new Response("Error in customer.created: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'customer.created',
      });

      break;
    case 'customer.subscription.trial_will_end':
      const { data: trialWillEndEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (trialWillEndEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'customer.subscription.trial_will_end',
      });

      break;
    case 'customer.subscription.updated':
      const { data: subUpdatedEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (subUpdatedEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      const updateSubResponse = await handleSubscriptionUpdated(
        data.object
      );

      if (!updateSubResponse) {
        return new Response("Error in customer.subscription.updated: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }


      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'customer.subscription.updated',
      });

      break;
    case 'customer.subscription.deleted':
      const { data: subDeletedEvent } = await supabase.from('stripe_events').select('id').eq('event_id', data.object.id).maybeSingle();

      if (subDeletedEvent) {
        return new Response("Event already happened: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      };

      const deleteSubResponse = await deactivateSub(
        data.object.items.data[0].subscription,
        new Date(data.object.ended_at * 1000)
      );

      if (!deleteSubResponse) {
        return new Response("Error in customer.subscription.deleted: ", {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        })
      }

      await supabase.from('stripe_events').insert({
        event_id: data.object.id,
        event_type: 'customer.subscription.deleted',
      });

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
