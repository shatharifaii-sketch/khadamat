// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type lookupMethod = "phone" | "email";

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    try {
      const body = await req.json();
      const method = body?.method as lookupMethod;
      const { phone, email } = body ?? {};

      console.log("DATA: ", phone, email, method);

      if (method !== "phone" && method !== "email") {
        return Response.json({ error: "invalid_method" }, { status: 400 });
      }

      const identifier =
        method === "phone" ? phone?.trum() : email?.trim().toLowerCase();

      if (typeof identifier !== "string" || identifier.length === 0) {
        return Response.json({ error: "missing_identifier" }, { status: 400 });
      }

      const supabase = ctx.supabaseAdmin;

      const query =
        method === "phone"
          ? supabase.from("profiles").select("id").eq("phone", identifier)
          : supabase
              .from("profiles_with_email")
              .select("id")
              .ilike("email", identifier);

      const { data: profile, error: profileError } = await query.maybeSingle();

      if (profileError) {
        console.error("Profile lookup failed: ", profileError);

        return Response.json(
          {
            userExists: false,
            phoneConfirmed: false,
            emailConfirmed: false,
            error: "lookup_failed",
          },
          { status: 500 },
        );
      }

      if (!profile) {
        return Response.json({
          userExists: false,
          phoneConfirmed: false,
          emailConfirmed: false,
          error: null
        });
      }

      const { data: authData, error: authError } =
        await supabase.auth.admin.getUserById(profile.id);

      if (authError || !authData.user) {
        console.error("Auth user lookup failed: ", authError);

        return Response.json({ error: "lookup_failed" }, { status: 500 });
      }

      const { user } = authData;

      return Response.json({
        userExists: true,
        phoneConfirmed: !!user.phone_confirmed_at,
        emailConfirmed: !!user.email_confirmed_at,
        error: null
      });
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
