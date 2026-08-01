// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

console.log("Hello from Functions!");

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const { supabaseAdmin } = ctx;

    try {
      const { phone, isLogin, fullName } = await req.json();

      const { data: recentRequest } = await supabaseAdmin
        .from("otp_requests")
        .select("created_at")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (
        recentRequest &&
        Date.now() - new Date(recentRequest.created_at).getTime() < 60000
      ) {
        return Response.json({
          success: false,
          error: "Too many requests. Please wait a minute before trying again.",
        });
      }

      const { data, error } = await supabaseAdmin.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: !isLogin,
          channel: "sms",
          data: {
            full_name: isLogin ? undefined : fullName,
          },
        },
      });

      if (error) {
        console.error("Error sending OTP: ", error);
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }

      await supabaseAdmin.from("otp_requests").insert({
        phone,
      });

      return Response.json({
        success: true,
        data,
      });
    } catch (error) {
      console.log("ERROR: ", error);
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/handle-phone-otp' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
