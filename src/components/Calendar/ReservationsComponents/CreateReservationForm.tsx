import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { createFormSchema, TimeFormat } from "@/types/reservations";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import ReservationDatePicker from "../ReservationDatePicker";
import ReservationTimePicker from "../ReservationTimePicker";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn, formatTime } from "@/lib/utils";
import useReservations from "@/hooks/useReservations";
import { useReservationsContext } from "@/contexts/ReservationsContext";
import { toast } from "sonner";

interface Props {
  serviceId: string;
  providerId: string;
  userId: string;
  onSuccess: () => void;
}

const CreateReservationForm = ({ serviceId, providerId, userId, onSuccess }: Props) => {
  const { t } = useTranslation("reservations");

  const [pending, setPending] = useState<boolean>(false);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");

  const { availabilityData } = useReservations({ serviceId, providerId });

  const { createReservation } = useReservationsContext();

  const availableWeekDays = [
    ...new Set(
      availabilityData?.data?.map((availability) => availability.day_of_week) ??
        [],
    ),
  ];

  const availabilityMargins = availabilityData?.data?.[0]
    ? {
        fromTime: availabilityData.data[0].from_time,
        toTime: availabilityData.data[0].to_time,
      }
    : undefined;

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      date: "",
      start_time: "",
      end_time: "",
      clientId: userId,
      providerId: providerId,
      serviceId: serviceId,
    },
  });

  const [date, fromTime, toTime] = form.watch([
    "date",
    "start_time",
    "end_time",
  ]);

  const isSubmitDisabled = !date || !fromTime || !toTime || pending;

  const onSubmit = async (data: z.infer<typeof createFormSchema>) => {
    console.log("VALID:", data);

    const { success, error } = await createReservation(data);

    if (!success || error) {
      console.log(error)
      // toast(t("error_occured"), {
      //   description: error ? t(error) : "unknown_error"
      // })
      return;
    }

    onSuccess?.();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("create_reservation.title")}</DialogTitle>
        <DialogDescription>
          {t("create_reservation.description")}
        </DialogDescription>
      </DialogHeader>

      <div>
        <form
          id="reservation-form"
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("FORM VALIDATION ERRORS:", errors);
          })}
        >
          <FieldGroup>
            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-date">
                    {t("create_reservation.pick_date")}
                  </FieldLabel>
                  <ReservationDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    weekDays={availableWeekDays}
                  />

                  <FieldDescription>
                    {t("create_reservation.date_field_description")}
                  </FieldDescription>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex flex-col">
              <Separator className="mb-3" />

              <Field
                className="flex flex-row items-center justify-center w-32 bg-white shadow-md px-5 py-2 rounded-full mx-auto mb-2"
                dir="ltr"
              >
                <FieldLabel
                  className={cn(
                    timeFormat === "12h"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {t("create_reservation.12_format")}
                </FieldLabel>
                <Switch
                  id="time-format"
                  checked={timeFormat === "24h"}
                  onCheckedChange={(checked) =>
                    setTimeFormat(checked ? "24h" : "12h")
                  }
                  className="max-w-11"
                />
                <FieldLabel
                  className={cn(
                    timeFormat === "24h"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {t("create_reservation.24_format")}
                </FieldLabel>
              </Field>

              <Controller
                name="start_time"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-time">
                      {t("create_reservation.pick_start_time")}
                    </FieldLabel>

                    <ReservationTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      timeFormat={timeFormat}
                      timeMargins={availabilityMargins}
                    />

                    <FieldDescription
                      className={cn(fieldState.error ? "" : "mb-4")}
                    >
                      {t("create_reservation.start_time_field_description", {
                        fromTime: formatTime(
                          availabilityData?.data?.[0]?.from_time ?? "",
                          timeFormat,
                        ),
                        toTime: formatTime(
                          availabilityData?.data?.[0]?.to_time ?? "",
                          timeFormat,
                        ),
                      })}
                    </FieldDescription>

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="end_time"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-time">
                      {t("create_reservation.pick_end_time")}
                    </FieldLabel>

                    <ReservationTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      timeFormat={timeFormat}
                      timeMargins={availabilityMargins}
                    />

                    <FieldDescription
                      className={cn(fieldState.error ? "" : "mb-4")}
                    >
                      {t("create_reservation.end_time_field_description")}
                    </FieldDescription>

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <Field className="mt-4 grid grid-cols-2" orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {t("create_reservation.reset")}
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {t("create_reservation.submit")}
            </Button>
          </Field>
        </form>
      </div>
    </>
  );
};

export default CreateReservationForm;
