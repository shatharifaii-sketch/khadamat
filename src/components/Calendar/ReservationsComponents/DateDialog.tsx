import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Reservation } from "@/contexts/ReservationsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, formatTime, truncateString } from "@/lib/utils";
import { TimeFormat } from "@/types/reservations";
import { formatDate } from "@fullcalendar/react";
import { CircleCheck, CircleX, Dot } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Props {
  date: Date;
  reservations: Reservation[];
  acceptReservation: ({ reservationId }: { reservationId: string }) => Promise<{
    success: boolean;
    error: string;
  }>;
  declineReservation: ({
    reservationId,
  }: {
    reservationId: string;
  }) => Promise<{
    success: boolean;
    error: string;
  }>;
}

const DateDialog = ({
  date,
  reservations,
  acceptReservation,
  declineReservation,
}: Props) => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");

  const isMobile = useIsMobile();

  const acceptRes = (reservationId: string) => {
    try {
      acceptReservation({
        reservationId: reservationId,
      }).then((data) => {
        if (data.success) toast.success(t("reservation_accepted"));
      });
    } catch (error) {
      console.log(error);
      toast.error(t("error_accepting"));
    }
  };

  const rejectRes = (reservationId: string) => {
    try {
      declineReservation({
        reservationId: reservationId,
      }).then((data) => {
        if (data.success) toast.success(t("reservation_rejected"));
      });
    } catch (error) {
      console.log(error);
      toast.error(t("error_rejecting"));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <p className="text-sm md:text-md">{t("date.title")}</p>
        </DialogTitle>
        <DialogDescription>
          <p className="text-xs md:text-sm">{t("date.description")}</p>
        </DialogDescription>

        <div
          className="text-start flex flex-col gap-3"
          dir={lang == "ar" ? "rtl" : "ltr"}
        >
          <div className="grid grid-cols-3 items-center">
            <p className="text-md md:text-xl col-span-2 text-sm md:text-md">
              {formatDate(date, {
                month: "long",
                year: "numeric",
                day: "numeric",
                weekday: "long",
                locale: lang,
              })}
            </p>
            <div
              className="flex shrink-0 items-center justify-start gap-2 mb-2 w-full"
              dir="ltr"
            >
              <FieldLabel
                className={cn(
                  "shrink-0",
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
                className="h-6 w-11 min-h-6 min-w-11 max-h-6 max-w-11 shrink-0"
              />

              <FieldLabel
                className={cn(
                  "shrink-0",
                  timeFormat === "24h"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {t("create_reservation.24_format")}
              </FieldLabel>
            </div>
          </div>

          {reservations.map((res, index) => (
            <div
              key={res.id}
              className={cn(
                "flex p-2 rounded-md bg-neutral-200 min-h-12",
                isMobile
                  ? "flex-col items-start justify-center"
                  : "flex-row justify-between items-center",
              )}
            >
              <div className={cn(isMobile ? "" : "mr-2 z-10 fixed")}>
                <p className="flex items-center">
                  {truncateString(res.service.title, 15)}
                  <Dot />
                  <span className="text-sm text-muted-foreground text-nowrap">
                    {truncateString(res.client.full_name, 15)}
                  </span>
                  <Dot />
                  <span className="text-xs md:text-sm text-muted-foreground text-nowrap">
                    {formatTime(res.start_time, timeFormat)}
                  </span>
                  <Dot />
                  <span className="text-xs md:text-sm text-muted-foreground text-nowrap">
                    {formatTime(res.end_time, timeFormat)}
                  </span>
                </p>
              </div>

              {!isMobile && (
                <div className="flex gap-1 justify-end w-full relative z-40">
                  <Button
                    onClick={() => acceptRes(res.id)}
                    variant="default"
                    className="bg-green-600 hover:bg-green-500 group min-w-12 flex items-center justify-center sticky z-50 transition-transform overflow-hidden"
                  >
                    <span className="opacity-0 group-hover:opacity-100 -mr-24 group-hover:mr-0 transition-all duration-300 text-green-600 group-hover:text-muted">
                      {t("event.accept")}
                    </span>
                    <CircleCheck size={18} />
                  </Button>
                  <Button
                    onClick={() => rejectRes(res.id)}
                    variant="destructive"
                    className="min-w-12 flex group items-center justify-center sticky z-50 overflow-hidden"
                  >
                    <span className="opacity-0 group-hover:opacity-100 -mr-24 group-hover:mr-0  transition-all duration-300 text-destructive group-hover:text-muted">
                      {t("event.reject")}
                    </span>
                    <CircleX size={18} />
                  </Button>
                </div>
              )}

              {isMobile && (
                <div className="grid grid-cols-2 items-center h-fit w-full gap-1 mt-2">
                    <Button
                      onClick={() => acceptRes(res.id)}
                      variant="default"
                      className="bg-green-600 hover:bg-green-500 group min-w-12 flex-1 items-center justify-center py-1"
                    >
                      <span className="">{t("event.accept")}</span>
                      <CircleCheck size={18} />
                    </Button>
                    <Button
                      onClick={() => rejectRes(res.id)}
                      variant="destructive"
                      className="min-w-12 flex group items-center justify-center overflow-hidden"
                    >
                      <span className="">{t("event.reject")}</span>
                      <CircleX size={18} />
                    </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogHeader>
    </>
  );
};

export default DateDialog;
