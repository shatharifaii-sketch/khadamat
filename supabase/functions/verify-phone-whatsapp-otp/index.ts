// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PhoneVerificationCodes = {
  id: string;
  expires_at: string;
  attempts: number;
  used: boolean;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function validateAttempt(data: PhoneVerificationCodes): { success: boolean, error: { code: string, message: string } } {
  if (!data) {
    return {
      success: false,
      error: {
        code: "phone_not_found",
        message: "Phone number not found",
      },
    };
  }

  if (new Date(data.expires_at) < new Date()) {
    return {
      success: false,
      error: {
        code: "token_expired",
        message: "Token has expired",
      },
    };
  }

  if (data.used) {
    return {
      success: false,
      error: {
        code: "token_used",
        message: "Token has already been used",
      },
    };
  }

  if (data.attempts >= 5) {
    return {
      success: false,
      error: {
        code: "too_many_attempts",
        message: "Too many attempts",
      },
    };
  }

  return {
    success: true,
    error: {
      code: "",
      message: "",
    }
  }
}

async function compareTokens(token: string, phone: string) {
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );

  const codeHash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");

  const {
    data,
    error
  } = await supabase
  .from("phone_verification_codes")
  .select("*")
  .eq("phone", phone)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

  if (error) {
    return {
      success: false,
      error,
    };
  }

  const { success, error: validateError } = validateAttempt(data);

  if (!success) {
    return {
      success: false,
      error: validateError,
    };
  }

  if (data.code_hash !== codeHash) {
    await supabase
      .from("phone_verification_codes")
      .update({ attempts: data.attempts + 1 })
      .eq("id", data.id);

      return {
        success: false,
        error: {
          code: "invalid_token",
          message: "Invalid token",
        },
      }
  } else {
    await supabase
      .from("phone_verification_codes")
      .update({
        used: true,
        attempts: data.attempts + 1,
        code_hash: null
      })
      .eq("id", data.id);

    return {
      success: true,
      error: null,
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
    const { phone, token } = await req.json();

    const { data, error: profileError } = await supabase.from("profiles").select("*").eq("phone", phone).maybeSingle();

    if (profileError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: profileError,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "phone_not_found",
            message: "Phone number not found",
          },
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    const { success, error } = await compareTokens(token, phone);

    if (!success) {
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
        }
      );
    }

    const { data: user, error: userError } = await supabase.auth.admin.updateUserById(
      data.id,
      {
        phone_confirm: true
      }
    )

    if (userError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: userError,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        error: null
      }),
      { headers: { "Content-Type": "application/json" } },
    )
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
      }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/verify-phone-whatsapp-otp' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
