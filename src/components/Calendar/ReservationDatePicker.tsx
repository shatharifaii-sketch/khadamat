import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";

interface ReservationDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: (date: Date) => boolean;
}

const ReservationDatePicker = ({
  value,
  onChange,
  disabled,
}: ReservationDatePickerProps) => {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

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
            <span>Pick a date</span>
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
          />
      </PopoverContent>
    </Popover>
  );
};

export default ReservationDatePicker;
