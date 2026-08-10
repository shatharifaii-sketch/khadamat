import { ReservationForm } from "@/contexts/ReservationsContext";
import * as z from "zod";

export const createFormSchema: z.ZodType<ReservationForm> = z
  .object({
    providerId: z.string().min(1),
    clientId: z.string().min(1),
    serviceId: z.string().optional(),
    date: z.iso.date(),
    start_time: z.iso.time(),
    end_time: z.iso.time()
  })
.superRefine(({ date, start_time, end_time }, ctx) => {
    const reservationStart = new Date(`${date}T${start_time}`);
    const reservationEnd = new Date(`${date}T${end_time}`);

    if (reservationEnd <= reservationStart) {
      ctx.addIssue({
        code: "custom",
        message: "invalid_times",
        path: ["end_time"]
      });
    }

    const minimumDateTime = new Date();
    minimumDateTime.setHours(minimumDateTime.getHours() + 24);

    if (reservationStart < minimumDateTime) {
      ctx.addIssue({
        code: "custom",
        message: "reservation_too_soon",
        path: ["date"]
      });

      ctx.addIssue({
        code: "custom",
        message: "reservation_too_soon",
        path: ["start_time"]
      })
    }
  });