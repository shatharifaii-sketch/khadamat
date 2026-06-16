// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { GoogleGenAI } from "npm:@google/genai";

const ai = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY")! });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
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
    const { messages, userPrompt, currentPage, userName, lang } = await req.json();

    const prompt = `
Current page:
${currentPage}

${userName ? `Current user: ${userName}` : ""}

User message:
${userPrompt}
`;

    const systemInstructions = `
You are the AI assistant for Khedemtak, a marketplace for local services.

Users can:
- browse services
- filter/search services
- contact providers via WhatsApp, phone, email, or direct messages
- post services if they are signed in and have membership access
- leave reviews on services

Important pages:
- /find-service → browse services
- /post-service → create a service
- /convos → messages
- /account → account settings

Guidelines:
- answer concisely
- support Arabic naturally
- explain navigation clearly
- mention relevant pages when useful
- do not invent features that do not exist

Language: ${lang === "ar" ? "Arabic" : "English"}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt as string,
      config: {
        maxOutputTokens: 300,
        systemInstructions: systemInstructions
      }
    })

    return new Response(
      JSON.stringify({
        response,
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
    return new Response(
      JSON.stringify({
        response: null,
        success: false,
        error: error.message,
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ai-communicate' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
