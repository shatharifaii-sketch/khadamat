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
  fetch: withSupabase({ auth: ["user", "secret"] }, async (req, ctx) => {
    const { supabase, userClaims } = ctx;

    try {
      const values = await req.json();

      const { error } = await supabase.from("conversation_deals").insert({
        provider_id: values.provider_id,
        client_id: values.client_id,
        service_id: values.service_id,
        created_by: userClaims.id,
        conversation_id: values.conversation_id,
        price: values.price,
        currency: values.currency,
      });

      if (error) {
        console.error("Error creating Deal: ", error);
        return {
          success: false,
          error: error.message,
        };
      }

      return Response.json({
        success: true,
        error: null,
      });
    } catch (error) {
      console.error(error);
      return Response.json({
        success: false,
        error,
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-deal' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
