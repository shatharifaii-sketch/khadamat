// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    try {
      const supabase = ctx.supabaseAdmin;

      const { phone, email, method } = await req.json();

      console.log("DATA: ", phone, email, method);

      if (method == "phone") {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("phone", phone)
          .maybeSingle();

        return Response.json({
          userExists: !!data,
          error: data ? null : "no_user_exists",
        });
      } else {
        const { data } = await supabase
          .from("profiles_with_email")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        console.log(data);

        return Response.json({
          userExists: !!data,
          error: data ? null : "no_user_exists",
        });
      }
    } catch (error) {
      console.log("ERROR: ", error);
      return Response.json({
        userExists: false,
        error: error,
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-if-user-exists' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
