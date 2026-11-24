// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { hashOtp } from "../_shared/otp.ts";

const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
const whatsappGraphApiVersion = Deno.env.get("WHATSAPP_GRAPH_API_VERSION")!;

async function generateOtp(phone: string, supabase: any) {
  await supabase.from("phone_verification_codes").delete().eq("phone", phone);

  const array = new Uint32Array(4);
  crypto.getRandomValues(array);

  const otp = ((array[0] % 900000) + 100000).toString();

  const otpHash = await hashOtp(phone, otp);

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
  console.log("SENDING WHATSAPP MESSAGE");
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
          code: "en_US",
        },
        components: [
          {
            type: "body",
            parameter: [
              {
                type: "text",
                parameter_name: "code",
                text: token,
              },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: token,
              },
            ],
          },
        ],
      },
    }),
  });

  if (response.status !== 200) {
    console.log(response);
    return {
      success: false,
      error: "error_sending_otp",
    };
  }

  return {
    success: true,
    error: null,
  };
}

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const { supabaseAdmin } = ctx;

    try {
      const { phone, lang } = await req.json();

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
          error: "too_many_requests",
        });
      }

      const { otp, error, success } = await generateOtp(phone, supabaseAdmin);

      if (!success || !otp) {
        return Response.json(
          {
            success: false,
            error: error ? "error_sending_otp" : "unknown_error",
          },
          {
            status: 400,
          },
        );
      }

      const { success: whatsappSuccess, error: whatsappError } =
        await sendWhatsappMessage(otp, phone, "en");

      if (!whatsappSuccess) {
        console.log(whatsappError);
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

      await supabaseAdmin.from("otp_requests").insert({
        phone,
      });
      return Response.json({
        success: true,
        error: null,
      });
    } catch (error) {
      console.log("ERROR: ", error);
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "unknown_error",
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
