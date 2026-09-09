import MyCalendarComponent from "@/components/Calendar/MyCalendarComponent"
import ReservationsServices from "@/components/Calendar/ReservationsServices";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Group } from "lucide-react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next"

const ReservationsCalendar = () => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";

  return (
    <div className="flex flex-col gap-5 w-full md:w-5/6 lg:w-4/6 mx-auto mt-7 items-center justify-center px-3">
        <div className="text-center">
          <h1 className="text-xl md:text-3xl">{t("page_title")}</h1>
        </div>
        <div className="grid grid-cols-1 grid-rows-2 lg:grid-rows-1 lg:grid-cols-3 gap-5 text-start w-full" dir={lang == "en" ? "ltr" : "rtl"}>
          <MyCalendarComponent />
          
          <Suspense fallback={<>
              <Group />
            </>}>
            <ErrorBoundary>
              <ReservationsServices />
            </ErrorBoundary>
          </Suspense>
        </div>
    </div>
  )
}

export default ReservationsCalendar