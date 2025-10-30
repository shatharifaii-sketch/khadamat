// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ServerClient } from "npm:postmark";

const client = new ServerClient(Deno.env.get("POSTMARK_SERVER_API_TOKEN"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const isOlderThan2Hours = (created_at: string | Date) =>
  (Date.now() - new Date(created_at).getTime()) > 2 * 60 * 60 * 1000;


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

    const { message, user_id } = await req.json();

    if (!isOlderThan2Hours(message.created_at)) {
      return new Response("Message is not older than 2 hours", { status: 400, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', message.conversation_id)
      .maybeSingle();

    if (error) throw error;

    if (user_id !== message.sender_id && (data.provider_id === user_id || data.client_id === user_id)) {
      const { data, error } = await supabase
        .from('profiles_with_email')
        .select('email')
        .eq('id', user_id)
        .maybeSingle();

      if (error) throw error;

      await client.sendEmailWithTemplate({
        From: `"(via Khedemtak Support)" <${Deno.env.get("APP_SUPPORT_EMAIL")}>`,
        To: data.email,
        TemplateId: Deno.env.get("POSTMARK_CHAT_TEMPLATE_ID"),
        TemplateModel: {
          name: message.name,
          product_name: Deno.env.get("APP_NAME"),
          action_url: Deno.env.get("POSTMARK_CHAT_TEMPLATE_ACTION_URL"),
          support_email: Deno.env.get("APP_SUPPORT_EMAIL"),
          sender_name: Deno.env.get("EMAIL_SENDER_NAME"),
          help_url: Deno.env.get("APP_HELP_URL")
        }
      })


      return new Response("email sent", { status: 200, headers: corsHeaders });
    }


  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-chat-email-notifications-dev' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
