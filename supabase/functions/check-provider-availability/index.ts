// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type ProviderAvailability = {
  id: string;
  from_time: string;
  to_time: string;
  day_of_week: number;
  provider_id: string;
  service_id: string;
  created_at: string;
};

type Reservation = {
  id: string;
  date: string | null;
  created_at: string | null;
  client_id: string | null;
  provider_id: string | null;
  service_id: string | null;
  status: string | null;
  provider_seen: boolean | null;
  client_seen: boolean | null;
  start_time: string;
  end_time: string;
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time");
  }

  return hours * 60 + minutes;
};

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req: Request, ctx) => {
    const { supabase } = ctx;

    try {
      const { providerId, date, start_time, end_time, serviceId } =
        await req.json();

      if (!providerId || !date || !start_time || !end_time || !serviceId) {
        return Response.json(
          {
            success: false,
            message: "more_data_needed",
            error: null,
          },
          { status: 400 },
        );
      }

      const requestedDate = new Date(`${date}T00:00:00`);
      const requestedDayOfWeek = requestedDate.getDay();

      const requestedStart = toMinutes(start_time);
      const requestedEnd = toMinutes(end_time);

      if (
        Number.isNaN(requestedStart) ||
        Number.isNaN(requestedEnd)
      ) {
        return Response.json(
          {
            success: false,
            message: "invalid_datetime",
            error: null,
          },
          { status: 400 },
        );
      }

      if (requestedEnd <= requestedStart) {
        return Response.json(
          {
            success: false,
            message: "invalid_time_range",
            error: null,
          },
          { status: 400 },
        );
      }

      const { data: availability, error: availabilityError } = await supabase
        .from("calendar_provider_availability")
        .select("*")
        .eq("provider_id", providerId)
        .eq("service_id", serviceId);

      if (availabilityError) {
        console.error(availabilityError);

        return Response.json(
          {
            success: false,
            message: "unexpected_error_occured",
            error: availabilityError,
          },
          { status: 500 },
        );
      }

      const available = availability.some((slot: ProviderAvailability) => {
        if (slot.day_of_week !== requestedDayOfWeek) {
          return false;
        }

        const availableFromMinutes = toMinutes(slot.from_time);
        const availableToMinutes = toMinutes(slot.to_time);

        return (
          requestedStart >= availableFromMinutes && requestedEnd <= availableToMinutes
        )
      });

      if (!available) {
        return Response.json({
          success: false,
          message: "provider_not_available",
          error: null,
        });
      }

      const { data: reservations, error: reservationError } = await supabase
        .from("calendar_reservations")
        .select("*")
        .eq("provider_id", providerId)
        .eq("date", date)
        .in("status", ["pending", "accepted"]);

      if (reservationError) {
        console.error(reservationError);

        return Response.json(
          {
            success: false,
            message: "failed_to_check_other_reservations",
            errro: reservationError,
          },
          { status: 500 },
        );
      }

      const hasConflict = reservations.some((reservation: Reservation) => {
        const existingStart = toMinutes(reservation.start_time);
        const existingEnd = toMinutes(reservation.end_time);

        return requestedStart < existingEnd && requestedEnd > existingStart;
      });

      if (hasConflict) {
        return Response.json({
          success: false,
          message: "provider_busy",
          error: null,
        });
      }

      return Response.json({
        success: true,
        message: "provider_available",
        error: null,
      });
    } catch (error) {
      console.log(error instanceof Error ? error.message : error);
      return Response.json({
        success: false,
        message:
          error instanceof Error ? error.message : "unexpected_error_occured",
        error: error,
      });
    }
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-provider-availability' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
