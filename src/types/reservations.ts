import { ReservationForm } from "@/contexts/ReservationsContext";
import * as z from "zod";

export const createFormSchema: z.ZodType<ReservationForm> = z
  .object({
    providerId: z.string().min(1),
    clientId: z.string().min(1),
    serviceId: z.string().optional(),
    date: z.iso.date(),
    start_time: z.iso.time(),
    end_time: z.iso.time(),
  })
  .superRefine(({ date, start_time, end_time }, ctx) => {
    const reservationStart = new Date(`${date}T${start_time}`);
    const reservationEnd = new Date(`${date}T${end_time}`);

    const durationMs = reservationEnd.getTime() - reservationStart.getTime();

    if (durationMs < 60 * 60 * 1000) {
      ctx.addIssue({
        code: "custom",
        message: "invalid_times",
        path: ["end_time"],
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reservationDate = new Date(`${date}T00:00:00`);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (reservationDate < tomorrow) {
      ctx.addIssue({
        code: "custom",
        message: "reservation_too_soon",
        path: ["date"],
      });

      ctx.addIssue({
        code: "custom",
        message: "reservation_too_soon",
        path: ["start_time"],
      });
    }
  });

export type TimeFormat = "24h" | "12h";

export const providerAvailabilitySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    fromTime: z.iso.time({ precision: -1 }),
    toTime: z.iso.time({ precision: -1 }),
  })
  .superRefine(({ fromTime, toTime }, ctx) => {
    const from = new Date(`1970-01-01T${fromTime}`);
    const to = new Date(`1970-01-01T${toTime}`);

    const difference = to.getTime() - from.getTime();

    if (difference <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "end_time_must_be_after_start_time",
        path: ["toTime"],
      });
    }

    if (difference < (60 * 60 * 1000)) {
      ctx.addIssue({
        code: "custom",
        message: "availability_must_be_at_least_one_hour",
        path: ["toTime"],
      });
    }
  });

export type ProviderAvailability = z.infer<typeof providerAvailabilitySchema>;
