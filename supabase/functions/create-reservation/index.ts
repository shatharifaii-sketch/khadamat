// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { Resend } from "npm:resend@latest";

type Reservation = {
  providerId: string;
  clientId: string;
  serviceId: string;
  date?: string;
  start_time?: string;
  end_time?: string;
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

async function getData(supabase: any, reservation: Reservation) {
  const { data: providerData, error: providerError } = await supabase
    .from("profiles_with_email")
    .select("email, name")
    .eq("id", reservation.providerId)
    .maybeSingle();

  if (providerError) {
    console.error("Error fetching provider data: ", providerError);
    return {
      providerData: null,
      clientData: null,
      serviceData: null,
    };
  }

  const { data: clientData, error: clientError } = await supabase
    .from("profiles_with_email")
    .select("email, name")
    .eq("id", reservation.clientId)
    .maybeSingle();

  if (clientError) {
    console.error("Error fetching client data: ", clientError);
    return {
      providerData,
      clientData: null,
      serviceData: null,
    };
  }

  const { data: serviceData, error: serviceError } = await supabase
    .from("services")
    .select("title")
    .eq("id", reservation.serviceId)
    .maybeSingle();

  if (serviceError) {
    console.error("Error fetching service data: ", serviceError);
    return {
      providerData,
      clientData,
      serviceData: null,
    };
  }

  return { providerData, clientData, serviceData };
}

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    const { supabase } = ctx;

    try {
      const reservation: Reservation = await req.json();

      const { providerData, clientData, serviceData } = await getData(
        supabase,
        reservation,
      );

      if (!providerData || !clientData || !serviceData) {
        return Response.json({
          success: false,
          error: "user_not_found",
        });
      }

      const { error } = await supabase.from("calendar_reservations").insert({
        client_id: reservation.clientId,
        provider_id: reservation.providerId,
        service_id: reservation.serviceId,
        date: reservation.date,
        start_time: reservation.start_time,
        end_time: reservation.end_time,
        status: "pending",
        provider_seen: false,
        client_seen: true,
      });

      if (error) {
        console.error("Error creating reservation: ", error);
        throw error;
      }

      const { error: resendError } = await resend.emails.send({
        from: "New Appointment <support@mail.khedemtak.com>",
        to: providerData.email,
        template: {
          id: "new_appointment",
          variables: {
            name: providerData.name,
            client_name: clientData.name,
            service_title: serviceData.title,
            reservation_date: reservation.date,
            start_time: reservation.start_time,
            end_time: reservation.end_time,
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
        success: true,
        error: null,
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: "server_error",
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-reservation' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
