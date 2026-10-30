import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@latest";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function formatDate(date?: string | Date | null) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

//helper 1: Handle expired subscriptions
async function handleExpiredSubs(sub: any) {
  console.log(`Subscription ${sub.id} has expired. Skipping.`);
  const { error: updateError } = await supabase
    .from('subscriptions_dev')
    .update({
      status: 'trial_expired',
      is_in_trial: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', sub.id);


  if (updateError) {
    console.error(`Error updating subscription ${sub.id} to expired:`, updateError);

    return false;
  }

  return true
}

//helper 2: Send reminder email for upcoming payment
async function sendReminderEmail(sub: any, user: any) {
  const now = new Date();
  const nextPaymentDate = new Date(sub.next_payment_date);
  const daysUntilPayment = Math.ceil(
    (nextPaymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilPayment > 3 || daysUntilPayment < 0) return false;

  const { data, error } = await resend.emails.send({
      from: "Khedemtak <support@mail.khedemtak.com>",
      to: user.email,
      template: {
        id: "ending_trial",
        variables: {
          name: user.full_name ?? 'مستخدم',
          subscription_date: formatDate(res.data.started_at),
          last_payment_date: formatDate(res.data.last_payment_date),
          subscription_cancel_date: formatDate(res.data.ended_at),
          help_url: Deno.env.get('APP_HELP_URL'),
        }
      }
    })

  return true;
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
    const now = new Date().toISOString();

    const { data: subs, error: subsError } = await supabase
      .from("subscriptions_dev")
      .select("*")
      .eq("is_in_trial", true)
      .eq("status", "active")
      .lt("trial_expires_at", now);

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

      if (!(await handleExpiredSubs(sub, supabase))) continue;
      await sendReminderEmail(sub, user);
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-subscriptions-dev' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
