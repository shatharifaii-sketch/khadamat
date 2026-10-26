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
      id,
      email,
      password,
      phone,
      is_admin,
      verify_email,
      verify_phone,
      admin,
      full_name,
    } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "required_id",
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

    const updates: {
      email?: string;
      password?: string;
      phone?: string;
      user_metadata: { full_name?: string };
      phone_confirm?: boolean;
      email_confirm?: boolean;
    } = {
      user_metadata: {
        full_name: full_name ?? "user"
      },
    };

    if (email) updates.email = email;
    if (password) {
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
      updates.password = password;
    }
    if (phone) updates.phone = phone;
    updates.phone_confirm = !verify_phone;
    updates.email_confirm = !verify_email;

    const { data, error } = await supabase.auth.admin.updateUserById(
      id,
      updates,
    );

    if (error) {
      console.error("Update user error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: "error_updating_user",
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

    if (admin) {
      const { error: adminError } = await supabase
        .from("user_roles")
        .upsert({ user_id: id, role: "admin" }, { onConflict: 'user_id' });

      if (adminError) {
        console.error("Error creating admin user: ", adminError);
        return new Response(
          JSON.stringify({
            success: false,
            user: null,
            error: "error_updating_admin",
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    } else {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", id)
        .maybeSingle();

      if (error) {
        console.error("Error checking admin: ", error);
        return new Response(
          JSON.stringify({
            success: false,
            user: null,
            error: "error_checking_admin",
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (data && data.id) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", id);

        if (error) {
          console.error("Error deleting admin: ", error);
          return new Response(
            JSON.stringify({
              success: false,
              user: null,
              error: "error_deleting_admin",
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
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: data.user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("SERVER ERROR: ", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "server_error",
      }),
      {
        status: 500,
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
