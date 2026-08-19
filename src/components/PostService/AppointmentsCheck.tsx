import { useTranslation } from "react-i18next";
import { CalendarDays, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { AvailabilityType } from "@/contexts/ReservationsContext";
import ProviderAvailbilityForm from "../Calendar/ReservationsComponents/ProviderAvailbilityForm";

interface Props {
  check: boolean;
  onChange: (value: boolean) => void;
  availability?: AvailabilityType[];
  onAvailabilityChange?: (value: AvailabilityType[]) => void;
}

const AppointmentsCheck = ({
  check,
  onChange,
  availability,
  onAvailabilityChange
}: Props) => {
  const { t } = useTranslation("services");
  const lang = localStorage.getItem("language") || "en";
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      className="flex items-center justify-start gap-5"
      dir={lang == "ar" ? "rtl" : "ltr"}
    >
      <Button
        variant={(check || availability.length > 0) ? "default" : "outline"}
        type="button"
        className="flex flex-1 items-center justify-between overflow-hidden"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={21} />
          {t("post_service.with_appointments")}
        </div>
        {availability && availability.length > 0 && <Pencil />}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={lang == "en" ? "ltr" : "rtl"}>
          <ProviderAvailbilityForm
            check={check}
            onChange={onChange}
            availability={availability}
            onAvailabilityChange={onAvailabilityChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsCheck;
