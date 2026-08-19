import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AvailabilityType } from "@/contexts/ReservationsContext";
import React from "react";
import { useTranslation } from "react-i18next";
import ReservationTimePicker from "../ReservationTimePicker";

interface Props {
  day: { value: number; text: string };
  onChange: (value: AvailabilityType | null) => void;

  availability?: AvailabilityType;
}

const DaySlot = ({ day, availability, onChange }: Props) => {
  const { t } = useTranslation("reservations");

  const enabled = !!availability;

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
        onChange({
            dayOfWeek: day.value,
            fromTime: "09:00",
            toTime: "17:00",
        });
    } else {
        onChange(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md p-4 bg-stone-50">
        <div className="flex items-center gap-3">
            <Checkbox 
                id={`day-${day.value}`}
                checked={enabled}
                onCheckedChange={handleCheckedChange}
            />

            <Label htmlFor={`day-${day.value}`}>
                {t(`days.${day.text.toLowerCase()}`)}
            </Label>
        </div>

        {enabled && availability && (
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label>
                        {t("availability_form.from")}
                    </Label>

                    <ReservationTimePicker 
                        value={availability.fromTime}
                        onChange={(value) => onChange({
                            ...availability,
                            fromTime: value,
                        })}
                        timeFormat="24h"
                    />
                </div>

                <div>
                    <Label>
                        {t("availability_form.to")}
                    </Label>

                    <ReservationTimePicker 
                        value={availability.toTime}
                        onChange={(value) => onChange({
                            ...availability,
                            toTime: value
                        })}
                        timeFormat="24h"
                    />
                </div>
            </div>
        )}
    </div>
  );
};

export default DaySlot;
