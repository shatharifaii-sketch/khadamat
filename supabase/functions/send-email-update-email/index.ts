// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Resend } from "npm:resend@latest";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function generateEmailLinks(oldEmail: string, newEmail: string) {
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'email_change_new',
      email: oldEmail,
      newEmail,
      redirectTo: 'http://localhost:8080/'
    });

    if (error) {
      console.error("Error generating link: ", error);
      throw error;
    }

    return {
      success: true,
      link: data.properties.action_link,
      otp: data.properties.email_otp
    }
  } catch (error) {
    console.error("Error generating link: ", error);
    return {
      success: false,
      error
    };
  }
}

async function sendEmail(email: string, name: string, link: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Support <support@mail.khedemtak.com>",
      to: email,
      template: {
        id: "email-verification",
        variables: {
          name,
          action_url: link
        }
      }
    });

    if (error) {
      console.error("Error sending email: ", error);
      throw error;
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.log(error);

    return {
      success: false,
      error
    };
  }
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
    const { oldEmail, newEmail, name } = await req.json();

    if (!oldEmail || !newEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Emails are required",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { success, link, otp } = await generateEmailLinks(oldEmail, newEmail);

    if (!success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: link,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { success: emailSuccess } = await sendEmail(newEmail, name, link);

    if (!emailSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error sending email",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
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
    console.error("subscription cancellation error:", error);

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
      }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email-update-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
