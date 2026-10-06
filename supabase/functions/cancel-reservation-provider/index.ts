// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { Resend } from "npm:resend@latest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

function formatTime(time: string, timeFormat: string = "12h") {
  if (!time) return "";

  const [hourString, minute] = time.slice(0, 5).split(":");
  const hour = Number(hourString);

  if (timeFormat === "24h") {
    return `${hourString}:${minute}`;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
}

async function getData(supabase: any, reservationId: string) {
  const { data: reservationData, error: reservationError } = await supabase
    .from("calendar_reservations")
    .select("provider_id, client_id, service_id, date, start_time, end_time")
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
    .select("email, full_name")
    .eq("id", reservationData.provider_id)
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
    .select("email, full_name")
    .eq("id", reservationData.client_id)
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
    .eq("id", reservationData.service_id)
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
  fetch: withSupabase({ auth: ["user", "secret"] }, async (req, ctx) => {
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

      if (reservationData.status === "accepted") {
        return Response.json(
          {
            success: false,
            error: "reservation_cannot_be_cancelled",
          },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      if (reservationData.status !== "pending") {
        return Response.json(
          {
            success: false,
            error: "reservation_cannot_be_cancelled",
          },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      const reservationStart = new Date(
        `${reservationData.date}T${reservationData.start_time}`,
      );

      if (reservationStart <= new Date()) {
        return Response.json(
          {
            success: false,
            error: "reservation_passed",
          },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      const { error } = await supabase
        .from("calendar-reservations")
        .update({ status: "cancel_requested" })
        .eq("id", reservationId);

      if (error) {
        console.error("Error updating reservation status: ", error);
        return Response.json({
          success: false,
          error: "failed_to_update_reservation",
        });
      }

      const { error: resendError } = await resend.emails.send({
        from: "Reservation Cancelled <support@mail.khedemtak.com>",
        to: clientData.email,
        template: {
          id: "appointment-deleted",
          variables: {
            name: clientData.full_name,
            client_name: providerData.full_name,
            service_title: serviceData.title,
            reservation_date: reservationData.date,
            start_time: formatTime(reservationData.start_time),
            end_time: formatTime(reservationData.end_time),
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

      return Response.json(
        {
          success: true,
          error: null,
        },
        { headers: corsHeaders },
      );
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/cancel-reservation-provider' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
