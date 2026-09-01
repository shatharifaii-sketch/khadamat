import { DateClickInfo, EventClickInfo, EventDisplayInfo } from "@fullcalendar/react";
import { EventCalendar } from "../event-calendar";
import themePlugin from "@fullcalendar/react/themes/forma";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import arLocale from "@fullcalendar/react/locales/ar";
import enLocale from "@fullcalendar/react/locales/en-gb";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/forma/theme.css";
import "@fullcalendar/react/themes/forma/palettes/purple.css";
import { Reservation, useReservationsContext } from "@/contexts/ReservationsContext";
import { useMemo, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useTranslation } from "react-i18next";
import { truncateString } from "@/lib/utils";
import { CircleCheck, CircleX, Clock8 } from "lucide-react";
import DateDialog from "./ReservationsComponents/DateDialog";
import ReservationEvent from "./ReservationsComponents/ReservationEvent";
import { toast } from "sonner";

function renderEventContent(eventInfo: EventDisplayInfo) {
  return (
    <div className="px-1 flex items-center justify-between w-full">
      <i>{truncateString(eventInfo.event.title, 10)}</i>
      <span>
        {
        eventInfo.event.extendedProps.status == "pending" ? (
          <Clock8 size={14} className="text-muted-foreground" />
        ) : 
        eventInfo.event.extendedProps.status == "accepted" ? (
          <CircleCheck size={14} className="text-green-600" />
        ) : (
          <CircleX size={14} className="text-destructive" />
        )}
      </span>
    </div>
  );
}

const MyCalendarComponent = () => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";
  const locale = lang == "ar" ? arLocale : enLocale;

  // const controller = useCalendarController();
  // const buttons = controller.getButtonState();

  const {
    reservations,
    loading,
    acceptReservation,
    declineReservation,
    cancelReservation,
    markSeen
  } = useReservationsContext();

  const [openDateDialog, setOpenDateDialog] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateReservations, setDateReservations] = useState<Reservation[] | null>();

  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [openEventDialog, setOpenEventDialog] = useState<boolean>(false);

  const addHour = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  const end = new Date();
  end.setHours(hours + 1, minutes, 0, 0);

  return end.toTimeString().slice(0, 5);
};

  const events = useMemo(() => {
    return reservations.map((reservation) => ({
      id: reservation.id,
      title: reservation.service?.title ?? "Reservation",
      start: `${reservation.date}T${reservation.start_time}`,
      end: `${reservation.date}T${reservation.end_time}`,
      extendedProps: reservation,
      color: 
        reservation.status === "pending"
          ? "#f59e0b"
          : reservation.status === "accepted"
          ? "#22c55e"
          : "#ef4444",
    }));
  }, [reservations]);

  const handleDateClick = (info: DateClickInfo) => {
    setSelectedDate(info.date);
    const dateRes = reservations.filter((r) => r.date == info.dateStr);

    console.log(dateRes);
    setDateReservations(dateRes);

    setOpenDateDialog(true);
  };

  const handleEventClick = (info: EventClickInfo) => {
    const reservation = info.event.extendedProps;
    setSelectedRes(reservations.find(r => r.id == reservation.id));
    setOpenEventDialog(true);
    
    try {
      markSeen({
        reservationId: reservation?.id
      })
    } catch (error) {
      console.log(error);
      toast.error(t("error_marking_seen"))
    }
  }

  return (
    <div className="border rounded-md">
      {/* <div className='toolbar'>
        <button
          onClick={() => controller.today()}
          disabled={buttons.today.isDisabled}
          aria-label={buttons.today.hint}
        >{buttons.today.text}</button>
        <div className='toolbar-title'>controller view</div>
      </div> */}
      <EventCalendar
        locale={locale}
        popoverCloseContent
        plugins={[themePlugin, dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        nowIndicator
        className="border-none outline-none"
      />

      <Dialog open={openDateDialog} onOpenChange={setOpenDateDialog}>
        <DialogContent dir={lang == "ar" ? "rtl" : "ltr"}>
          <DateDialog
            date={selectedDate}
            reservations={dateReservations}
            acceptReservation={acceptReservation}
            declineReservation={declineReservation}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openEventDialog} onOpenChange={setOpenEventDialog}>
        <DialogContent dir={lang == "ar" ? "rtl" : "ltr"}>
          <ReservationEvent
            acceptReservation={acceptReservation}
            reservation={selectedRes}
            declineReservation={declineReservation}
            deleteReservation={cancelReservation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCalendarComponent;
