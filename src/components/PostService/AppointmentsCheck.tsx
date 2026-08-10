import { useTranslation } from "react-i18next";
import { Switch } from "../ui/switch";
import { CalendarDays } from "lucide-react";

interface Props {
  check: boolean;
  onChange: (value: boolean) => void;
}

const AppointmentsCheck = ({ check, onChange }: Props) => {
  const { t } = useTranslation("services");
  const lang = localStorage.getItem("language") || "en";

  return (
    <div
      className="flex items-center justify-start gap-5 mb-2"
      dir={lang == "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-2">
        <CalendarDays size={21} />
        <label htmlFor="check">{t("post_service.with_appointments")}</label>
      </div>
      <Switch id="with_appointments" dir="ltr" checked={check} onCheckedChange={onChange} />
    </div>
  );
};

export default AppointmentsCheck;
