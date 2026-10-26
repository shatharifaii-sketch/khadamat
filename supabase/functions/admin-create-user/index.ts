// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isPwned, validatePassword } from "../_shared/password.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

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
    const {
      email,
      password,
      phone,
      is_admin,
      verify_email,
      verify_phone,
      admin,
      full_name,
    } = await req.json();

    if (!password || (password && !email && !phone)) {
      return new Response(
        JSON.stringify({
          success: false,
          user: null,
          error: "missing_data",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const pwError = validatePassword(password);

    if (pwError) {
      console.error("Error validating error");
      return Response.json(
        { success: false, error: pwError },
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (await isPwned(password)) {
      return Response.json({
        success: false,
        error: "password_breached",
      });
    }

    if (!is_admin) {
      return new Response(
        JSON.stringify({
          success: false,
          user: null,
          error: "unauthorized",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        phone,
        user_metadata: { full_name: full_name ?? "new_user" },
        phone_confirm: !!phone && !verify_phone,
        email_confirm: !!email && !verify_email,
      });

    if (userError) {
      console.error("Error creating user: ", userError);
      return new Response(
        JSON.stringify({
          success: false,
          user: null,
          error: userError,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (admin) {
      const { error: adminError } = await supabase
        .from("user_roles")
        .insert({ user_id: userData.user?.id, role: "admin" });

      if (adminError) {
        console.error("Error creating admin user: ", adminError);
        return new Response(
          JSON.stringify({
            success: false,
            user: null,
            error: adminError,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userData.user,
        error: null,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        user: null,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/admin-create-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
