import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AvailabilityType } from "@/contexts/ReservationsContext";
import { useTranslation } from "react-i18next";
import DaySlot from "./DaySlot";
import { Button } from "@/components/ui/button";

interface Props {
  check: boolean;
  onChange: (value: boolean) => void;
  availability?: AvailabilityType[];
  onAvailabilityChange?: (value: AvailabilityType[]) => void;
}

const weekDays = [
  { value: 0, text: "Sunday" },
  { value: 1, text: "Monday" },
  { value: 2, text: "Tuesday" },
  { value: 3, text: "Wednesday" },
  { value: 4, text: "Thursday" },
  { value: 5, text: "Friday" },
  { value: 6, text: "Saturday" },
];

const ProviderAvailbilityForm = ({
  check,
  onChange,
  availability,
  onAvailabilityChange,
}: Props) => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";

  const handleDayChange = (
    dayOfWeek: number,
    value: AvailabilityType | null,
  ) => {
    if (!onAvailabilityChange) return;

    if (value === null) {
      onAvailabilityChange(
        availability.filter((item) => item.dayOfWeek !== dayOfWeek),
      );

      return;
    }

    const exists = availability.some((item) => item.dayOfWeek === dayOfWeek);

    if (exists) {
      onAvailabilityChange(
        availability.map((item) =>
          item.dayOfWeek === dayOfWeek ? value : item,
        ),
      );
    } else {
      onAvailabilityChange([...availability, value]);
    }
  };

  const handleReset = () => {
    onAvailabilityChange?.([]);
    onChange(false);
  };

  const handleSave = () => {
    console.log("SAVING: ");
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("availability_form.title")}</DialogTitle>

        <DialogDescription>{t("availability_form.desc")}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-10 overflow-y-auto max-h-[500px]">
        <div className="flex items-center gap-2">
          <Checkbox
            id="with_appointments"
            checked={check}
            onCheckedChange={onChange}
          />
          <Label htmlFor="with_appointments">
            {t("availability_form.with_appointments")}
          </Label>
        </div>

        <div>
          <Label>{t("availability_form.days")}</Label>

          <div className="mt-2 rounded-md bg-muted p-2 flex flex-col gap-2">
            {weekDays.map((day) => {
              const dayAvailability = availability.find(
                (item) => item.dayOfWeek === day.value,
              );

              return (
                <DaySlot
                  key={day.value}
                  day={day}
                  availability={dayAvailability}
                  onChange={(value) => handleDayChange(day.value, value)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1" type="button" variant="ghost">
          {t("availability_form.reset")}
        </Button>
      </div>
    </>
  );
};

export default ProviderAvailbilityForm;
