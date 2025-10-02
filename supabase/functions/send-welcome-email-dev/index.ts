// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ServerClient } from "npm:postmark";

const client = new ServerClient(Deno.env.get("POSTMARK_SERVER_API_TOKEN"));

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*", // or your frontend URL
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  
  try {
    const { name, email } = await req.json();

    const result = await client.sendEmailWithTemplate({
      From: `"اهلا بك (via Khedemtak Support)" <${Deno.env.get("APP_SUPPORT_EMAIL")}>`,
      To: Deno.env.get("APP_SUPPORT_EMAIL"),
      TemplateId: Deno.env.get("POSTMARK_WELCOME_TEMPLATE_ID"),
      TemplateModel: {
        name,
        product_name: Deno.env.get("APP_NAME"),
        action_url: Deno.env.get("POSTMARK_WELCOME_TEMPLATE_ACTION_URL"),
        support_email: Deno.env.get("APP_SUPPORT_EMAIL"),
        sender_name: Deno.env.get("EMAIL_SENDER_NAME"),
        help_url: Deno.env.get("APP_HELP_URL")
      }
    });

    return new Response(JSON.stringify({ success: true, result }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
        status: 200
    })
  } catch (error) {
    console.error("Error sending email: ", error);
    return new Response(JSON.stringify({ success: false, error }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-welcome-email' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
