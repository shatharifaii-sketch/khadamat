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

async function sendWelcomeEmail(email: string, name: string, otp: string) {
  const { data, error } = await resend.emails.send({
    from: "welcome <support@mail.khedemtak.com>",
    to: email,
    template: {
      id: "welcome",
      variables: {
        name,
        otp,
      },
    },
  });

  if (error) {
    console.error("Error sending email: ", error);
    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
    data,
  };
}

async function generateEmailLinks(email: string, password: string, supabase: any) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
  });

  if (error) {
    console.error("Error generating link: ", error);
    return {
      success: false,
      link: null,
      otp: null,
      error: "network_error",
    };
  }

  return {
    success: true,
    link: data.properties.action_link,
    otp: data.properties.email_otp,
    error: null
  };
}

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["secret"] }, async (req, ctx) => {
    const { supabaseAdmin } = ctx;
    try {
      const { email, password, name } = await req.json();

      const linkResponse = await generateEmailLinks(email, password, supabaseAdmin);

      if (!linkResponse.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: linkResponse.error,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      const emailResponse = await sendWelcomeEmail(
        email,
        name,
        linkResponse.otp,
      );

      if (!emailResponse.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: emailResponse.error,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      return new Response(
          JSON.stringify({
            success: true
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
    } catch (error) {
      console.log("ERROR: ", error);
      return Response.json({
        error,
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email-otp' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
