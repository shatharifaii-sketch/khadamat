import { Button } from '@/components/ui/button';
import { Reservation, ReservationList } from '@/contexts/ReservationsContext'
import { CalendarEvent, downloadIcs, googleCalendarUrl } from '@/lib/calendarLinks';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next'

const AddToCalendar = ({ reservation, display }: { reservation: Reservation | ReservationList; display?: "card" | "" }) => {
    const { t } = useTranslation("reservations");

    if (reservation.status !== "accepted") return null;

    const event: CalendarEvent = {
        id: reservation.id,
        title: reservation.service?.title ?? t("reservation"),
        date: reservation.date,
        startTime: reservation.start_time,
        endTime: reservation.end_time,
        description: t("calendar_event_description"),
        location: reservation.service?.is_online ? null : reservation.service?.location
    }

  return (
    <div className={cn(
        'grid mt-2 gap-2',
        display == "card" ? "grid-cols-1" : "grid-cols-2"
    )}>
        <Button asChild variant="outline">
            <a href={googleCalendarUrl(event)} target='_blank' rel="noopener noreferrer">
                <img width="48" height="48" src="https://img.icons8.com/color/48/google-calendar--v2.png" alt="google-calendar--v2" className='p-1'/>
                {t("add_to_google_calendar")}
            </a>
        </Button>
        <Button type="button" variant="outline" onClick={() => downloadIcs(event)} className='bg-muted'>
            {t("add_to_calendar_file")}
        </Button>
    </div>
  )
}

export default AddToCalendar