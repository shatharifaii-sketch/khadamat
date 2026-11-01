// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validatePassword } from "../_shared/password.ts";

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

Deno.serve(async (req: Request) => {
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
    const { email, name, password, passwordConfirm } = await req.json();

    if (password !== passwordConfirm) {
      console.error("Passwords do not match");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Passwords do not match",
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
      return new Response(
        JSON.stringify({ success: false, error: pwError }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // if (await isPwned(password)) {
    //   return Response.json({
    //     success: false,
    //     error: "password_breached",
    //   });
    // }

    const { data: checkData, error: checkError } =
      await supabase.functions.invoke("check-if-user-exists", {
        body: {
          email: email,
          method: "email",
        },
      });

    if (checkError) {
      console.error("Error checking user data: ", checkError);

      return new Response(
        JSON.stringify({
          success: false,
          error: "network_error",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const {
      userExists,
      phoneConfirmed,
      emailConfirmed,
      error: checkDataError,
    } = checkData;

    if (checkDataError) {
      console.error("Error checking user data: ", checkDataError);

      return new Response(
        JSON.stringify({
          success: false,
          error: checkDataError,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (userExists && emailConfirmed) {
      console.error("User exists");
      return new Response(
        JSON.stringify({
          success: false,
          error: "user_exists",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    } else if (userExists && !emailConfirmed) {
      const { data, error } = await supabase.functions.invoke(
        "send-email-otp",
        {
          body: {
            email,
            password,
            name,
          },
        },
      );

      if (error) {
        console.error("Server error sending otp: ", error);
        return Response.json({
          success: false,
          data: null,
          error: "network_error",
        });
      }

      if (!data.success) {
        console.error("Error sending otp: ", data.error);
        return Response.json({
          success: false,
          data: null,
          error: data.error,
        });
      }
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: name,
      },
    });

    if (error) {
      console.error("Error creating user: ", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: sendOtpData, error: sendOtpError } =
      await supabase.functions.invoke("send-email-otp", {
        body: {
          email,
          password,
          name,
        },
      });

    if (sendOtpError) {
      console.error("Server error sending otp: ", sendOtpError);
      return Response.json({
        success: false,
        data: null,
        error: "network_error",
      });
    }

    if (!sendOtpData.success) {
      console.error("Error sending otp: ", sendOtpData.error);
      return Response.json({
        success: false,
        data: null,
        error: sendOtpData.error,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Checkout error:", error);

    return new Response(
      JSON.stringify({
        success: false,
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/register-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
