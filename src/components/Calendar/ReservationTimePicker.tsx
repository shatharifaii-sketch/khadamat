import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn, toMinutes } from "@/lib/utils";
import { Button } from "../ui/button";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ReservationTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  timeFormat: string;

  timeMargins?: {
    fromTime: string;
    toTime: string;
  };
}

const ReservationTimePicker = ({
  value,
  onChange,
  timeFormat,
  timeMargins,
}: ReservationTimePickerProps) => {
  const { t } = useTranslation("reservations");
  const [open, setOpen] = useState<boolean>(false);

  const displayValue = value?.slice(0, 5) || "";

  const fromTime = timeMargins ? toMinutes(timeMargins.fromTime) : 0;

  const toTime = timeMargins ? toMinutes(timeMargins.toTime) : 24 * 60;

  const handleTimeChange = (time: string) => {
    onChange(`${time}:00`);
    setOpen(false);
  };

  const formatTime = (time: string) => {
    if (!time) return "";

    const [hourString, minute] = time.split(":");
    const hour = Number(hourString);

    if (timeFormat === "24h") {
      return `${hourString}:${minute}`;
    }

    const period = hour >= 12 ? "pm" : "am";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
  };

  const timeOptions = useMemo(() => {
    const times: string[] = [];

    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const h = hour.toString().padStart(2, "0");
        const m = minute.toString().padStart(2, "0");

        times.push(`${h}:${m}`);
      }
    }

    return times;
  }, []);

  const disabledTimeOptions = (time: string) => {
  const timeInMinutes = toMinutes(time);

  return timeInMinutes < fromTime || timeInMinutes > toTime;
};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <Clock className="mr-2 h-4 w-4" />

          {displayValue || t("create_reservation.pick_time")}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
      className="w-[220px] max-h-[300px] overflow-y-auto p-0" 
      align="start"
      onWheel={(e) => e.stopPropagation()}
      >
        <div className="p-1">
          {timeOptions.map((time) => (
            <Button
              key={time}
              type="button"
              disabled={disabledTimeOptions(time)}
              variant={displayValue === time ? "secondary" : "ghost"}
              className={cn("w-full justify-start font-normal", disabledTimeOptions(time) ? "hidden" : "")}
              onClick={() => handleTimeChange(time)}
              dir="ltr"
            >
              {formatTime(time)}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReservationTimePicker;
