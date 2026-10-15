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

        const {
          data: checkData,
          error: checkError,
        } = await supabase.functions.invoke("check-if-user-exists", {
          body: {
            phone,
            method: "phone",
            email: null,
          },
        });

        const { userExists, phoneConfirmed, error: inCheckError } = checkData ?? {}

        if (checkError) {
          console.log("server error checking user", checkError)
          return Response.json(
            {
              success: false,
              error: "lookup_failed",
            },
            {
              status: 500,
            },
          );
        }

        if (inCheckError) {
          console.log("error checking user", inCheckError)

          return Response.json(
            {
              success: false,
              error: inCheckError
            }
          )
        }

        if (userExists && phoneConfirmed) {
          return Response.json({
            success: false,
            error: "user_exists",
          });
        }

        const { data, error } = await supabase.functions.invoke(
          "handle-phone-otp",
          {
            body: {
              phone,
              lang: lang ?? null,
            },
          },
        );

        if (error) {
          console.log("error sending otp on register", error)
          return Response.json({
            success: false,
            error: "server_error",
          });
        }

        if (!data.success) {
          if (data.error) {
            return Response.json({
              success: false,
              error: data.error,
            });
          } else {
            return Response.json({
              success: false,
              error: "unknown_error",
            });
          }
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
