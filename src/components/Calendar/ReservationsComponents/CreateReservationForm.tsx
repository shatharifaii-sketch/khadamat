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
import { cn } from "@/lib/utils";
import useReservations from "@/hooks/useReservations";

interface Props {
  serviceId: string;
  providerId: string;
  userId: string;
}

const CreateReservationForm = ({ serviceId, providerId, userId }: Props) => {
  const { t } = useTranslation("reservations");

  const [pending, setPending] = useState<boolean>(false);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");

  const { availabilityData } = useReservations({ serviceId, providerId });

  console.log(availabilityData)

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

  const onSubmit = (data: z.infer<typeof createFormSchema>) => {
    console.log("RES DATA: ", data);
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
        <form id="reservation-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                    />

                    <FieldDescription
                      className={cn(fieldState.error ? "" : "mb-4")}
                    >
                      {t("create_reservation.start_time_field_description")}
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
            <Button type="submit">{t("create_reservation.submit")}</Button>
          </Field>
        </form>
      </div>
    </>
  );
};

export default CreateReservationForm;
