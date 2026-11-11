// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { Resend } from "npm:resend@latest";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["user", "secret"] }, async (req, ctx) => {
    const { supabase } = ctx;

    const { values, role } = await req.json();

    try {
    const { data: dealData, error: dealError } = await supabase.from("conversation_deals").select("conversation_id, client_id, provider_id, service_id, price, currency").maybeSingle();

    if (dealError) {
      console.error("Error getting deal data: ", dealError);
        return {
          success: false,
          error: dealError.message
        }
    }

    const { data: sendTo, error: sendToError } = await supabase.from("profiles_with_email").select("email").eq("id", role == "client" ? dealData.provider_id : dealData.client_id).maybeSingle();

      if (sendToError) {
        console.error("Error getting sendTo data: ", sendToError);
        return {
          success: false,
          error: sendToError.message
        }
      }

      const { data: userData, error: userError } = await supabase.from("profiles_with_email").select("full_name, email, phone").eq("id", role == "client" ? dealData.client_id : dealData.provider_id).maybeSingle();

      if (userError) {
        console.error("Error getting userData data: ", userError);
        return {
          success: false,
          error: userError.message
        }
      }

      const conversationLink = `
      ${Deno.env.get("APP_URL_PROD")}/chat/${dealData.conversation_id}/${dealData.client_id}/${dealData.service_id}/${dealData.provider_id}
      `;

      const { error: resendError } = await resend.emails.send({
        from: "Khedemtak <support@mail.khedemtak.com>",
        to: sendTo.email,
        template: {
          id: "deal-accepted",
          variables: {
            role: role == "client" ? "الزبون" : "مقدم الخدمة",
            name: userData.full_name,
            phone: JSON.stringify(userData.phone),
            deal_price: `${JSON.stringify(dealData.price)} ${dealData.currency}`,
            conversation_link: conversationLink
          }
        }
      });

      if (resendError) {
        console.error("Error sending email: ", resendError);
        return {
          success: false,
          error: resendError
        }
      }

    return Response.json({
        success: true,
        error: null,
      });
    } catch (error) {
      console.error(error);
      return Response.json({
        success: false,
        error
      })
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/accept-deal' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
