// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {

    if (req.method === 'OPTIONS') {
      return Response.json({ ok: true }, { headers: corsHeaders })
    }

    const { supabase } = ctx;

    try {
      const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (error) {
      return Response.json({
        success: false,
        data: null,
        error: "Database error",
      });
    }

    return Response.json({
      success: true,
      data,
      error: null,
    });
    } catch (error) {
      return Response.json({
        success: false,
        data: null,
        error: "SERVER ERROR!",
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-user-roles' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
