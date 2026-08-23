import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Reservation } from "@/contexts/ReservationsContext";
import { cn, formatTime, truncateString } from "@/lib/utils";
import { TimeFormat } from "@/types/reservations";
import { formatDate } from "@fullcalendar/react";
import { CircleCheck, CircleX, Dot } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  date: Date;
  reservations: Reservation[];
}

const DateDialog = ({ date, reservations }: Props) => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("date.title")}</DialogTitle>
        <DialogDescription>{t("date.description")}</DialogDescription>

        <div
          className="text-start flex flex-col gap-3"
          dir={lang == "ar" ? "rtl" : "ltr"}
        >
          <div className="grid grid-cols-2">
            <h2>
              {formatDate(date, {
                month: "long",
                year: "numeric",
                day: "numeric",
                weekday: "long",
                locale: lang,
              })}
            </h2>
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
              className="flex items-center justify-between p-2 rounded-md bg-neutral-200"
            >
              <div>
                <p className="flex items-center">
                  {truncateString(res.service.title, 15)}
                  <Dot />
                  <span className="text-sm text-muted-foreground">
                    {truncateString(res.client.full_name, 15)}
                  </span>
                  <Dot />
                  <span className="text-sm text-muted-foreground">{formatTime(res.start_time, timeFormat)}</span>
                  <Dot />
                  <span className="text-sm text-muted-foreground">{formatTime(res.end_time, timeFormat)}</span>
                </p>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-500"
                >
                  <CircleCheck size={18} />
                </Button>
                <Button variant="destructive" className="">
                  <CircleX size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogHeader>
    </>
  );
};

export default DateDialog;
