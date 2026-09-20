// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
const whatsappGraphApiVersion = Deno.env.get("WHATSAPP_GRAPH_API_VERSION")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function generateOtp(phone: string) {
  await supabase.from("phone_verification_codes").delete().eq("phone", phone);

  const array = new Uint32Array(4);
  crypto.getRandomValues(array);

  const otp = (array[0] % 900000 + 100000).toString();

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(otp)
  );

  const otpHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  

  const { data, error } = await supabase.from("phone_verification_codes").insert({
    phone,
    code_hash: otpHash,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  if (error) {
    return {
      otp: null,
      error,
      success: false
    }
  };

  return {
    otp,
    error: null,
    success: true
  };
}

async function sendWhatsappMessage(token: string, phoneNumber: string, lang: string) {
  const url = `https://graph.facebook.com/${whatsappGraphApiVersion}/${whatsappPhoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${whatsappAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "verification_code",
        language: {
          code: lang == "en" ? "en" : "ar"
        },
        components: [
          {
            type: "body",
            "parameters": [
              {
                type: "text",
                text: lang == "en" ? `Your verification code is ${token}` : `رمز التحقق الخاص بك هو ${token}`
              }
            ]
          }
        ]
      }
    })
  });

  if (response.status !== 200) {
    return {
      success: false,
      error: `Failed to send WhatsApp message: ${response.statusText}`
    }
  }

  return {
    success: true,
    error: null
  };
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
    const { phone, lang } = await req.json();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    
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

    if (!user) {
      return new Response(
        JSON.stringify({
          success: true,
          error: "User not found",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { otp, error, success } = await generateOtp(phone);

    if (!success || !otp) {
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

    const { success: whatsappSuccess, error: whatsappError } = await sendWhatsappMessage(otp, phone, lang);

    if (!whatsappSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          error: whatsappError,
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
      }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-register-whatsapp-message' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
