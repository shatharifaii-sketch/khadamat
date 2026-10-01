// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
const whatsappGraphApiVersion = Deno.env.get("WHATSAPP_GRAPH_API_VERSION")!;


async function checkEligibility(phone: string, supabase: any) {
  const { data, error } = await supabase
    .from("phone_verification_codes")
    .select("phone, created_at")
    .eq("phone", phone)
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error,
    };
  }

  if (
    data &&
    new Date(data.created_at) > new Date(Date.now() - 5 * 60 * 1000)
  ) {
    return {
      success: false,
      error: {
        code: "too_many_requests",
        message: "Too many requests",
      },
    };
  }

  return {
    success: true,
    error: null,
  };
}


async function generateOtp(phone: string, supabase: any) {
  const { success, error: eligibilityError } =
    await checkEligibility(phone, supabase);

  if (!success) {
    return {
      otp: null,
      error: eligibilityError,
      success: false,
    };
  }


  await supabase
    .from("phone_verification_codes")
    .delete()
    .eq("phone", phone);


  const array = new Uint32Array(1);
  crypto.getRandomValues(array);

  const otp = (array[0] % 900000 + 100000).toString();


  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(otp)
  );


  const otpHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");


  const { error } = await supabase
    .from("phone_verification_codes")
    .insert({
      phone,
      code_hash: otpHash,
      expires_at: new Date(
        Date.now() + 5 * 60 * 1000
      ).toISOString(),
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
  lang: string
) {
  const url =
    `https://graph.facebook.com/${whatsappGraphApiVersion}/${whatsappPhoneNumberId}/messages`;


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
          code: lang === "en" ? "en" : "ar",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text:
                  lang === "en"
                    ? `Your verification code is ${token}`
                    : `رمز التحقق الخاص بك هو ${token}`,
              },
            ],
          },
        ],
      },
    }),
  });


  if (!response.ok) {
    return {
      success: false,
      error: await response.text(),
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
    async (req, ctx) => {

      try {
        const supabase = ctx.supabaseAdmin;


        const {
          phone,
          lang,
          name,
          password,
          passwordConfirm,
        } = await req.json();



        const { data: existingUserData, error: existingUserError } =
          await supabase
            .from("profiles")
            .select("id")
            .eq("phone", phone)
            .maybeSingle();



        if (existingUserError) {
          return Response.json(
            {
              success: false,
              error: existingUserError,
            },
            { status: 400 }
          );
        }



        if (existingUserData) {
          return Response.json(
            {
              success: false,
              error: "User already exists",
            },
            { status: 400 }
          );
        }



        if (password !== passwordConfirm) {
          return Response.json(
            {
              success: false,
              error: "Passwords do not match",
            },
            { status: 400 }
          );
        }



        const { data, error: userError } =
          await supabase.auth.admin.createUser({
            phone,
            password,
            user_metadata: {
              full_name: name,
            },
          });



        if (userError) {
          return Response.json(
            {
              success: false,
              error: userError.message,
            },
            { status: 400 }
          );
        }



        const {
          otp,
          error,
          success,
        } = await generateOtp(phone, supabase);



        if (!success || !otp) {
          return Response.json(
            {
              success: false,
              error,
            },
            { status: 400 }
          );
        }



        const {
          success: whatsappSuccess,
          error: whatsappError,
        } = await sendWhatsappMessage(
          otp,
          phone,
          lang
        );



        if (!whatsappSuccess) {
          return Response.json(
            {
              success: false,
              error: whatsappError,
            },
            { status: 400 }
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
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
          { status: 500 }
        );
      }
    }
  ),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-otp-with-whatsapp' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
