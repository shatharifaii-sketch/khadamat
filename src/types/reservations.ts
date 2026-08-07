import { ReservationForm } from "@/contexts/ReservationsContext";
import * as z from "zod";

export const createFormSchema: z.ZodType<ReservationForm> = z
  .object({
    providerId: z.string().min(1),
    clientId: z.string().min(1),
    serviceId: z.string().optional(),
    date: z.iso.date(),
    time: z.iso.time(),
  })
.superRefine(({ date, time }, ctx) => {
    const reservationDateTime = new Date(`${date}T${time}`);

    const minimumDateTime = new Date();
    minimumDateTime.setDate(minimumDateTime.getDate() + 1);

    if (reservationDateTime < minimumDateTime) {
      ctx.addIssue({
        code: "custom",
        message: "Reservation must be at least one day in the future",
        path: ["date"],
      });

      ctx.addIssue({
        code: "custom",
        message: "Reservation must be at least one day in the future",
        path: ["time"],
      });
    }
  });