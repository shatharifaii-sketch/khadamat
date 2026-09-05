// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { Resend } from "npm:resend@latest";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

async function getData(supabase: any, reservationId: string) {
  const { data: reservationData, error: reservationError } = await supabase
    .from("reservations")
    .select("providerId, clientId, serviceId, date, start_time, end_time")
    .eq("id", reservationId)
    .maybeSingle();

  if (reservationError) {
    console.error("Error fetching reservation data: ", reservationError);
    return {
      reservationData: null,
      providerData: null,
      clientData: null,
      serviceData: null,
    };
  }

  const { data: providerData, error: providerError } = await supabase
    .from("profiles_with_email")
    .select("email, name")
    .eq("id", reservationData.providerId)
    .maybeSingle();

  if (providerError) {
    console.error("Error fetching provider data: ", providerError);
    return {
      reservationData,
      providerData: null,
      clientData: null,
      serviceData: null,
    };
  }

  const { data: clientData, error: clientError } = await supabase
    .from("profiles_with_email")
    .select("email, name")
    .eq("id", reservationData.clientId)
    .maybeSingle();

  if (clientError) {
    console.error("Error fetching client data: ", clientError);
    return {
      reservationData,
      providerData,
      clientData: null,
      serviceData: null,
    };
  }

  const { data: serviceData, error: serviceError } = await supabase
    .from("services")
    .select("title")
    .eq("id", reservationData.serviceId)
    .maybeSingle();

  if (serviceError) {
    console.error("Error fetching service data: ", serviceError);
    return {
      reservationData,
      providerData,
      clientData,
      serviceData: null,
    };
  }

  return { reservationData, providerData, clientData, serviceData };
}

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const { supabase } = ctx;

    try {
      const { reservationId } = await req.json();

      const { reservationData, providerData, clientData, serviceData } =
        await getData(supabase, reservationId);

      if (!reservationData || !providerData || !clientData || !serviceData) {
        return Response.json({
          success: false,
          error: "reservation_data_not_found",
        });
      }

      const { error: resendError } = await resend.emails.send({
        from: "Client Request <support@mail.khedemtak.com>",
        to: providerData.email,
        template: {
          id: "appointment-delete-request",
          variables: {
            name: providerData.name,
            client_name: clientData.name,
            service_title: serviceData.title,
            reservation_date: reservationData.date,
            start_time: reservationData.start_time,
            end_time: reservationData.end_time,
            calendar_url: "https://khadamat.com/reservations-calendar",
          },
        },
      });

      if (resendError) {
        console.error("Error sending email: ", resendError);
        return {
          success: false,
          error: resendError,
        };
      }

      return Response.json({
        message: `Hello ${name}!`,
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: "invalid_request",
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/cancel-reservation-request' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
