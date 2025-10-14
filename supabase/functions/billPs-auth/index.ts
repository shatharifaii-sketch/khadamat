// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("BILLPS_API_KEY");
    const API_APP_DATA = Deno.env.get("BILLPS_APP_DATA");
    const HOST_URL = Deno.env.get("BILLPS_HOST_URL");

    if (!API_KEY || !API_APP_DATA) {
      throw new Error("Bill.ps credentials not set");
    }

    const url = `${HOST_URL}api/loginBill?api_data=${API_APP_DATA}&apiKey=${API_KEY}`

    const tokenResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
      }
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.token) {
      throw new Error("Failed to get Bill.ps token");
    }

    return new Response(JSON.stringify({ token: tokenData.token }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: corsHeaders,
      status: 500
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/billPs-auth' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/