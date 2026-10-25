// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
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
      const { email, password } = await req.json();

      const { data: checkData, error: checkError } =
        await supabase.functions.invoke("check-if-user-exists", {
          body: {
            method: "email",
            email: email,
          },
        });

      if (checkError) {
        console.error("Error checking user data: ", checkError);

        return new Response(
          JSON.stringify({
            success: false,
            error: "network_error",
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      const {
        userExists,
        username,
        phoneConfirmed,
        emailConfirmed,
        error: checkDataError
      } = checkData;

      if (userExists && !emailConfirmed) {
        const { data, error } = await supabase.functions.invoke("send-email-otp", {
          body: {
            email,
            password,
            name: username ?? "Khedemtak User"
          }
        });

        if (error) {
          console.error("Server error sending otp: ", error);
          return Response.json({
            success: false,
            data: null,
            error: "network_error"
          })
        }

        if (!data.success) {
          console.error("Error sending otp: ", data.error);
          return Response.json({
            success: false,
            data: null,
            error: data.error
          })
        }

        return Response.json({
          success: true,
          message: "otp_sent",
          error
        })
      } else if (!userExists) {
        return Response.json({
          success: false,
          data: null,
          error: "user_not_found"
        })
      }

      console.log("EMAIL: ", email, "PASSWORD: ", password)

      return {
        success: true,
        message: "",
        error: null
      };
    } catch (error) {
      console.error("ERROR: ", error);
      return Response.json({
        success: false,
        data: null,
        error: "network_error"
      })
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sign-user-in' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
