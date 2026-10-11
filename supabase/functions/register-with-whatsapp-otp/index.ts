// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
const whatsappGraphApiVersion = Deno.env.get("WHATSAPP_GRAPH_API_VERSION")!;

async function generateOtp(phone: string, supabase: any) {
  await supabase.from("phone_verification_codes").delete().eq("phone", phone);

  const array = new Uint32Array(4);
  crypto.getRandomValues(array);

  const otp = ((array[0] % 900000) + 100000).toString();

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(otp),
  );

  const otpHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { data, error } = await supabase
    .from("phone_verification_codes")
    .insert({
      phone,
      code_hash: otpHash,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

  if (error) {
    return {
      otp: null,
      error,
      success: false,
    };
  }

  return {
    otp,
    error: null,
    success: true,
  };
}

async function sendWhatsappMessage(
  token: string,
  phoneNumber: string,
  lang: string,
) {
  console.log("SENDING WHATSAPP MESSAGE")
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
          code: lang == "en" ? "en" : "ar",
        },
      },
    }),
  });

  if (response.status !== 200) {
    return {
      success: false,
      error: `Failed to send WhatsApp message: ${response.statusText}`,
    };
  }

  return {
    success: true,
    error: null,
  };
}

export default {
  fetch: withSupabase(
    {
      auth: ["publishable", "secret"],
    },
    async (req: any, ctx: any) => {
      if (req.method !== "POST") {
        return new Response(
          JSON.stringify({
            error: "Method not allowed",
          }),
          {
            status: 405,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      console.log("Registering user...");

      try {
        const { supabaseAdmin: supabase } = ctx;

        const { phone, lang, name, password, passwordConfirm } =
          await req.json();

        if (password !== passwordConfirm) {
          return Response.json(
            {
              success: false,
              error: "Passwords do not match",
            },
            { status: 400 },
          );
        }

        const { success: createUserSuccess, error: createUserError } =
          await supabase.functions.invoke("create-user", {
            body: JSON.stringify({
              phone,
              password,
              fullName: name,
            }),
          });

        if (!createUserSuccess && createUserError) {
          return Response.json(
            {
              success: false,
              error: createUserError,
            },
            {
              status: 400,
            },
          );
        }

        const { otp, error, success } = await generateOtp(phone, supabase);

        if (!success || !otp) {
          return Response.json(
            {
              success: false,
              error: error,
            },
            {
              status: 400,
            },
          );
        }

        const { success: whatsappSuccess, error: whatsappError } =
          await sendWhatsappMessage(otp, phone, lang);

        if (!whatsappSuccess) {
          return Response.json(
            {
              success: false,
              error: whatsappError,
            },
            {
              status: 400,
            },
          );
        }

        return Response.json({
          success: true,
          error: null,
        });
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        );
      }
    },
  ),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/register-with-whatsapp-otp' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
