import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { arSA, enUS } from "react-day-picker/locale";

interface ReservationDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  weekDays?: number[];
}

const ReservationDatePicker = ({
  value,
  onChange,
  weekDays = [],
}: ReservationDatePickerProps) => {
  const lang = localStorage.getItem("language") || "en";

  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

  const disabled = (date: Date) => {
    const dayOfWeek = date.getDay();

    // Provider doesn't work this day
    if (!weekDays.includes(dayOfWeek)) {
      return true;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Today and past dates are disabled
    if (selectedDate < tomorrow) {
      return true;
    }

    return false;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selectedDate}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon />

          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span>MM dd, YYYY</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;

            onChange(format(date, "yyyy-MM-dd"));
          }}
          disabled={disabled}
          className="rounded-lg border"
          captionLayout="label"
          locale={
            lang == "en" ? enUS : arSA
          }
          dir={
            lang == "en" ? "ltr" : "rtl"
          }
        />
      </PopoverContent>
    </Popover>
  );
};

export default ReservationDatePicker;
