// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashOtp } from "../_shared/otp.ts";

type PhoneVerificationCodes = {
  id: string;
  expires_at: string;
  attempts: number;
  used: boolean;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function compareTokens(token: string, phone: string) {
  const codeHash = await hashOtp(phone, token);

  const { data, error } = await supabase.rpc("verify_phone_code", { p_phone: phone, p_code_hash: codeHash })

  if (error) {
    console.error("Error verifying phone: ", error)
    return {
      success: false,
      error: "server_error"
    }
  }

  if (data != 'ok') {
    return {
      success: false,
      error: data
    }
  } else {
    return {
      success: true,
      error: null
    }
  }
}

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

  try {
    const { phone, token, fullName, password } = await req.json();

    const { success, error } = await compareTokens(token, phone);

    if (!success && error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const { data, error: createError } = await supabase.functions.invoke(
      "create-user",
      {
        body: {
          phone,
          password,
          fullName,
          phoneConfirm: true,
        },
      },
    );

    if (createError) {
      console.error("Creating user error: ", createError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "server_error",
        }),
      );
    }

    if (!data.success && data.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: data.error,
        }),
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        error: null,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("subscription cancellation error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/verify-phone-whatsapp-otp' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
