import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ServerClient } from "npm:postmark";

const client = new ServerClient(Deno.env.get("POSTMARK_SERVER_API_TOKEN"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

//helper 1: Handle expired subscriptions
async function handleExpiredSubs(sub: any, supabase: any) {
  if (!sub.expires_at || new Date(sub.expires_at) >= new Date()) return false;

  console.log(`Subscription ${sub.id} has expired. Skipping.`);
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('id', sub.id);


  if (updateError) {
    console.error(`Error updating subscription ${sub.id} to expired:`, updateError);
  }

  return true
}

//helper 2: Send reminder email for upcoming payment
async function sendReminderEmail(sub: any, user: any, client: any) {
  const now = new Date();
  const nextPaymentDate = new Date(sub.next_payment_date);
  const daysUntilPayment = Math.ceil(
    (nextPaymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilPayment > 3 || daysUntilPayment < 0) return false;

  await client.sendEmailWithTemplate({
    From: `"${Deno.env.get("EMAIL_SENDER_NAME")}" <${Deno.env.get("APP_SUPPORT_EMAIL")}>`,
    To: user?.email ?? Deno.env.get("APP_SUPPORT_EMAIL"),
    TemplateId: Number(Deno.env.get("POSTMARK_REMINDER_TEMPLATE_ID")),
    TemplateModel: {
      name: user?.full_name || "مستخدم",
      product_name: Deno.env.get("APP_NAME"),
      action_url: Deno.env.get("POSTMARK_REMINDER_TEMPLATE_ACTION_URL"),
      support_email: Deno.env.get("APP_SUPPORT_EMAIL"),
      sender_name: Deno.env.get("EMAIL_SENDER_NAME"),
      help_url: Deno.env.get("APP_HELP_URL"),
    },
  });

  return true;
}

//helper 3: Handle transactions for subscriptions
async function handleTransaction(sub: any, user: any, supabase: any, client: any) {
  const { data: tx, error: transactionError } = await supabase.from('subscription_transactions')
        .select('*')
        .eq('subscription_id', sub.id)
        .eq('payment_status', 'pending')
        .lte('billing_period_end', new Date().toISOString())
        .maybeSingle();

      if (transactionError) {
        console.error(`Error fetching transaction for subscription ${sub.id}:`, transactionError);
        throw transactionError;
      }

      if (!tx) {
        console.log(`No pending transaction found for subscription ${sub.id}, creating one.`);

        const billingPeriodStart = new Date(sub.next_payment_date);
        const billingPeriodEnd = new Date(billingPeriodStart);
        if (sub.billing_cycle === 'Monthly') {
          billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);
        } else {
          billingPeriodEnd.setFullYear(billingPeriodEnd.getFullYear() + 1);
        }

        const { error: insertError } = await supabase.from('subscription_transactions').insert({
          subscription_id: sub.id,
          user_id: sub.user_id,
          amount: sub.amount,
          billing_period_start: billingPeriodStart.toISOString(),
          billing_period_end: billingPeriodEnd.toISOString(),
          payment_status: 'pending',
          currency: sub.currency,
          coupon_id: sub.coupon_id || null,
          coupon_used: sub.used_coupon_on_start || false
        }).select().maybeSingle();

        if (insertError) {
          console.error(`Error creating transaction for subscription ${sub.id}:`, insertError);
          return;
        }


      } else {
        await client.sendEmailWithTemplate({
          From: `"اهلا بك (via Khedemtak Support)" <${Deno.env.get("APP_SUPPORT_EMAIL")}>`,
          To: Deno.env.get("APP_SUPPORT_EMAIL"),
          TemplateId: Deno.env.get("POSTMARK_REMINDER_TEMPLATE_ID"),
          TemplateModel: {
            name: user?.full_name || 'مستخدم',
            product_name: Deno.env.get("APP_NAME"),
            action_url: Deno.env.get("POSTMARK_REMINDER_TEMPLATE_ACTION_URL"),
            support_email: Deno.env.get("APP_SUPPORT_EMAIL"),
            sender_name: Deno.env.get("EMAIL_SENDER_NAME"),
            help_url: Deno.env.get("APP_HELP_URL")
          }
        });
      }
}


// Main function to handle incoming requests
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

    const { data: subs, error: subsError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active");

    if (subsError) throw subsError;

    for (const sub of subs) {
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", sub.user_id)
        .maybeSingle();

      if (userError) {
        console.error(`Error fetching user ${sub.user_id}:`, userError);
        continue;
      }

      if (await handleExpiredSubs(sub, supabase)) continue;
      await sendReminderEmail(sub, user, client);
      await handleTransaction(sub, user, supabase, client);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Subscription check complete" }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error("Cron job failed:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});