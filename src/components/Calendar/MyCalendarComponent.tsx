import FullCalendar, { DateClickInfo, EventClickInfo, EventDisplayInfo, useCalendarController } from "@fullcalendar/react";
import { EventCalendar } from "../event-calendar";
import themePlugin from "@fullcalendar/react/themes/forma"; // YOUR THEME
import dayGridPlugin from "@fullcalendar/react/daygrid";
import arLocale from "@fullcalendar/react/locales/ar";
import enLocale from "@fullcalendar/react/locales/en-gb";

import "@fullcalendar/react/skeleton.css"; // ALWAYS NEED SKELETON
import "@fullcalendar/react/themes/forma/theme.css"; // YOUR THEME
import "@fullcalendar/react/themes/forma/palettes/purple.css"; // YOUR THEME'S PALETTE
import { useReservationsContext } from "@/contexts/ReservationsContext";
import { useMemo, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useTranslation } from "react-i18next";

function renderEventContent(eventInfo: EventDisplayInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
}

const MyCalendarComponent = () => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";
  const locale = lang == "ar" ? arLocale : enLocale;

  // const controller = useCalendarController();
  // const buttons = controller.getButtonState();

  const { reservations, loading } = useReservationsContext();

  const [openBookingDialog, setOpenBookingDialog] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

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
      end: `${reservation.date}T${addHour(reservation.end_time)}`,
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
    console.log(info.dateStr);
    setSelectedDate(info.date);
    setOpenBookingDialog(true);
  };

  const handleEventClick = (info: EventClickInfo) => {
    const reservation = info.event.extendedProps;

    console.log(reservation);
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

      <Dialog open={openBookingDialog} onOpenChange={setOpenBookingDialog}>
        <DialogContent dir={lang == "ar" ? "rtl" : "ltr"}>
          
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCalendarComponent;
