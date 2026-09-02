// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    {
      auth: ["publishable", "secret"],
    },
    async (req, ctx) => {
      if (req.method !==
        "POST"
      ) {
        return new Response(JSON.stringify({
          error:
            "Method not allowed"
        }), {
          status:
            405
          ,
          headers: {
            "Content-Type"
              :
              "application/json"
          },
        });
      }

      console.log("Registering user...");

      try {
        const supabase = ctx.supabaseAdmin;


        const {
          phone,
          lang,
          name,
          password,
          passwordConfirm,
        } = await req.json();



        if (password !== passwordConfirm) {
          return Response.json(
            {
              success: false,
              error: "Passwords do not match",
            },
            { status: 400 }
          );
        }

        const { data, error } = await supabase.auth.signInWithOtp({
          phone: phone,
          options: {
            shouldCreateUser: true,
            channel: "sms"
          }
        })


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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/register-with-whatsapp-otp' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
