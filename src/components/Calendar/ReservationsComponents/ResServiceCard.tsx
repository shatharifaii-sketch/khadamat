import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import useReservations, { ReservationsService } from "@/hooks/useReservations";
import { Dot } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ProviderAvailbilityForm from "./ProviderAvailbilityForm";
import { useForm, UseFormSetValue } from "react-hook-form";
import {
  providerAvailabilityFormSchema,
  ProviderAvailabilityFormValues,
} from "@/types/reservations";
import { zodResolver } from "@hookform/resolvers/zod";
import { normalizeTime } from "@/lib/utils";

interface Props {
  service: ReservationsService;
  userId: string;
}

const ResServiceCard = ({ service, userId }: Props) => {
  const { t } = useTranslation("reservations");

  const [openAvailabilityForm, setOpenAvailbailityForm] = useState(false);

  const form = useForm<ProviderAvailabilityFormValues>({
    resolver: zodResolver(providerAvailabilityFormSchema),
    defaultValues: {
      withAppointments: service.with_appointments,
      availability: service.availability.map((av) => ({
      ...av,
      fromTime: normalizeTime(av.fromTime),
      toTime: normalizeTime(av.toTime),
    })),
    },
  });

  const { updateAvailability } = useReservations({
    providerId: userId,
    serviceId: service.id,
  });

  const onSubmit = async (values: ProviderAvailabilityFormValues) => {
    console.log(values);

    updateAvailability(values);
  };

  const {
  handleSubmit,
  watch,
  setValue,
  formState: { isSubmitting, isDirty, errors },
} = form;

  return (
    <Card>
      <CardHeader className="px-3 py-2">
        <CardTitle className="text-md">{service.title}</CardTitle>
        <CardDescription className="flex items-center justify-start text-wrap">
          {!service.is_online && service.location ? (
            t(service.location)
          ) : service.is_online ? (
            <p>{t("service.card.online")}</p>
          ) : (
            ""
          )}
          <Dot />
          {service.price_range}
        </CardDescription>
      </CardHeader>
      <CardFooter className="px-3 pb-3">
        <Dialog
          open={openAvailabilityForm}
          onOpenChange={setOpenAvailbailityForm}
        >
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full text-wrap">
              {t("service.card.update_availability")}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("FORM VALIDATION ERRORS", errors);
              })}
            >
              <ProviderAvailbilityForm
                check={watch("withAppointments")}
                onChange={(value) =>
                  setValue("withAppointments", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                availability={watch("availability")}
                onAvailabilityChange={(value) =>
                  setValue("availability", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                updating={true}
                errors={errors}
                isSubmitting={isSubmitting}
                isDirty={isDirty}
              />
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default ResServiceCard;
