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
import { createFormSchema } from "@/types/reservations";
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

interface Props {
  serviceId: string;
  providerId: string;
  userId: string;
}

const CreateReservationForm = ({ serviceId, providerId, userId }: Props) => {
  const { t } = useTranslation("reservations");
  const [pending, setPending] = useState<boolean>(false);

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

  const onSubmit = (data: z.infer<typeof createFormSchema>) => {};
  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("create_reservation.title")}</DialogTitle>
        <DialogDescription>
          {t("create_reservation.description")}
        </DialogDescription>
      </DialogHeader>

      <div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  />

                  <FieldDescription>
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
                  />

                  <FieldDescription>
                    {t("create_reservation.end_time_field_description")}
                  </FieldDescription>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <Field className="mt-4 grid grid-cols-2" orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            {t("create_reservation.reset")}
          </Button>
          <Button type="submit" form="form-rhf-demo">
            {t("create_reservation.submit")}
          </Button>
        </Field>
      </div>
    </>
  );
};

export default CreateReservationForm;
