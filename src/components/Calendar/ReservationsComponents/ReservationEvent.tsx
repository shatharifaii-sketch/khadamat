import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Reservation } from "@/contexts/ReservationsContext";
import { cn, formatTime } from "@/lib/utils";
import { TimeFormat } from "@/types/reservations";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Props {
  reservation: Reservation;
  acceptReservation: ({ reservationId }: { reservationId: string }) => Promise<{
    success: boolean;
    error: string;
  }>;
  declineReservation: ({
    reservationId
  }: {
    reservationId: string;
  }) => Promise<{
    success: boolean;
    error: string;
  }>;
  deleteReservation: ({ reservationId }: { reservationId: string }) => Promise<{
    success: boolean;
    error: string;
  }>;
}

const ReservationEvent = ({
  reservation,
  acceptReservation,
  declineReservation,
  deleteReservation,
}: Props) => {
  const { t } = useTranslation("reservations");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");

  const badgeVariant =
    reservation.status == "pending"
      ? "secondary"
      : reservation.status == "accepted"
        ? "default"
        : reservation.status == "delete requested"
          ? "outline"
          : "destructive";

  const acceptRes = () => {
    try {
      acceptReservation({
        reservationId: reservation.id,
      }).then((data) => {
        if (data.success) toast.success(t("reservation_accepted"));
      });
    } catch (error) {
      console.log(error);
      toast.error(t("error_accepting"));
    }
  };

  const rejectRes = () => {
    try {
      declineReservation({
        reservationId: reservation.id,
      }).then((data) => {
        if (data.success) toast.success(t("reservation_rejected"));
      });
    } catch (error) {
      console.log(error);
      toast.error(t("error_rejecting"));
    }
  };

  const deleteRes = () => {
    try {
      deleteReservation({
        reservationId: reservation.id,
      }).then((data) => {
        if (data.success) toast.success(t("reservation_deleted"));
      });
    } catch (error) {
      console.log(error);
      toast.error(t("error_deleting"));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("event.title")}</DialogTitle>
        <DialogDescription>{t("event.description")}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-3">
          <h2>
            {reservation.service.title}
            <Badge variant={badgeVariant}>{t(reservation.status)}</Badge>
          </h2>
          <div
            className="flex shrink-0 items-center gap-2 mb-2 w-full"
            dir="ltr"
          >
            <FieldLabel
              className={cn(
                "shrink-0",
                timeFormat === "12h" ? "text-primary" : "text-muted-foreground",
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
              className="h-6 w-11 min-h-6 min-w-11 max-h-6 max-w-11 shrink-0"
            />

            <FieldLabel
              className={cn(
                "shrink-0",
                timeFormat === "24h" ? "text-primary" : "text-muted-foreground",
              )}
            >
              {t("create_reservation.24_format")}
            </FieldLabel>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p>
              {t("event.client")}: {reservation.client.full_name}
            </p>
            <p className="mb-2">
              {t("event.phone")}: {reservation.client.phone}
            </p>
            <p>
              {t("event.date")}: {reservation.date}
            </p>
            <p>
              {t("event.start_time")}:{" "}
              {formatTime(reservation.start_time, timeFormat)}
            </p>
            <p>
              {t("event.end_time")}:{" "}
              {formatTime(reservation.end_time, timeFormat)}
            </p>
          </div>

          <div className="grid grid-rows-2 gap-2">
            <Button
              onClick={acceptRes}
              className="bg-green-600 hover:bg-green-500"
            >
              {t("event.accept")}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={deleteRes} variant="ghost">
                {t("event.delete")}
              </Button>
              <Button onClick={rejectRes} variant="destructive">
                {t("event.reject")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationEvent;
