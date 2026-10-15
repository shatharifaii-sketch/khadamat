// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@latest";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const MIN_LEN = 10;
const MAX_LEN = 120;

function validatePassword(pw: unknown): string | null {
  if (typeof pw !== "string") return "invalid_password";
  const len = [...pw].length;
  if (len < MIN_LEN) return "password_too_short";
  if (len > MAX_LEN) return "password_too_long";
  return null;
}

async function isPwned(pw: string): Promise<boolean> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(pw));
  const hex = [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const prefix = hex.slice(0, 5);
  const suffix = hex.slice(5);
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const text = await res.text();
    return text.split("\n").some((l) => l.split(":")[0].trim() === suffix);
  } catch (error) {
    return false;
  }
}

async function sendWelcomeEmail(email: string, name: string, otp: string) {
  const { data, error } = await resend.emails.send({
    from: "welcome <support@mail.khedemtak.com>",
    to: email,
    template: {
      id: "welcome",
      variables: {
        name,
        otp,
      },
    },
  });

  if (error) {
    console.error("Error sending email: ", error);
    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
    data,
  };
}

async function generateEmailLinks(email: string, password: string) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
  });

  if (error) {
    console.error("Error generating link: ", error);
    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
    link: data.properties.action_link,
    otp: data.properties.email_otp,
  };
}

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
      console.error("Error validating error")
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
        error: "password_breached"
      })
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

    const linkResponse = await generateEmailLinks(email, password);

    if (!linkResponse.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: linkResponse.error,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const emailResponse = await sendWelcomeEmail(email, name, linkResponse.otp);

    if (!emailResponse.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: emailResponse.error,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
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
