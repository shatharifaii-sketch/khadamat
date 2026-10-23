// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { Resend } from "npm:resend@latest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["user", "secret"] }, async (req, ctx) => {
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

    const { userClaims, supabase } = ctx;

    try {
      const {
        conversation_id,
        sender_id,
        message,
        client_id,
        provider_id,
        service_id,
      } = await req.json();

      if (!conversation_id || !sender_id || !message || !client_id || !provider_id) {
        console.error({
          conversation_id,
        sender_id,
        message,
        client_id,
        provider_id,
        service_id,
        })
        return Response.json({
          success: false,
          error: "missing_data"
        })
      }

      const { data: clientData, error: clientError } = await supabase
        .from("profiles_with_email")
        .select("full_name, email, phone")
        .eq("id", client_id)
        .maybeSingle();

      if (clientError) {
        console.error("CLIENT ERROR: ", clientError);
        return Response.json({
          success: false,
          error: "error_getting_data",
        });
      }

      const { data: providerData, error: providerError } = await supabase
        .from("profiles_with_email")
        .select("full_name, email, phone")
        .eq("id", provider_id)
        .maybeSingle();

      if (providerError) {
        console.error("PROVIDER ERROR: ", providerError);
        return Response.json({
          success: false,
          error: "error_getting_data",
        });
      }

      const conversationLink = `
      ${Deno.env.get("APP_URL_PROD")}/chat/${conversation_id}/${client_id}/${service_id}/${provider_id}
      `;

      const { error: resendError } = await resend.emails.send({
        from: "New Message <support@mail.khedemtak.com>",
        to: sender_id == client_id ? providerData.email : clientData.email,
        template: {
          id: "new-message",
          variables: {
            name:
              sender_id == client_id
                ? clientData.full_name
                : providerData.full_name,
            phone:
              sender_id == client_id ? clientData.phone ?? "" : providerData.phone ?? "",
            message: message,
            conversation_link: conversationLink,
          },
        },
      });

      if (resendError) {
        console.error("RESEND ERROR: ", resendError)
        return Response.json({
          success: false,
          error: "error_sending_notification",
        });
      }

      return Response.json({
        success: true,
        error: null
      });
    } catch (error) {
      console.error("UNEXPECTED ERROR: ", error)
      return Response.json({
        success: false,
        error: "unexpected_error_occured",
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-message-notification-email' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
