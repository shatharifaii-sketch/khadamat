import MyCalendarComponent from "@/components/Calendar/MyCalendarComponent"
import { useTranslation } from "react-i18next"

const ReservationsCalendar = () => {
  const { t } = useTranslation("reservations");

  return (
    <div className="flex flex-col gap-5 w-5/6 mx-auto mt-7 md:w-4/5 lg:w-1/2">
        <div className="text-center">
          <h1 className="text-xl md:text-3xl">{t("page_title")}</h1>
        </div>
        <MyCalendarComponent />
    </div>
  )
}

export default ReservationsCalendar