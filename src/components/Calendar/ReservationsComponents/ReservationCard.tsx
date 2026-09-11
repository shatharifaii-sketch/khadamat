import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Reservation, ReservationList, useReservationsContext } from "@/contexts/ReservationsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, formatTime } from "@/lib/utils";
import { TimeFormat } from "@/types/reservations";
import { formatDate } from "@fullcalendar/react";
import { Check, Clock, LayoutDashboard, Loader, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  reservation: ReservationList;
}

const ReservationCard = ({ reservation }: Props) => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";
  const [requestingCancel, setRequestingCancel] = useState(false);

  const isMobile = useIsMobile();
  const { requestCancelReservation, cancelReservation, refresh } = useReservationsContext();

  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");

  const handleRequestCancel = async () => {
    if (!reservation) return;
    setRequestingCancel(true);
    
    const { success, error } = reservation.status == "accepted" ? await requestCancelReservation({
      reservationId: reservation.id,
      serviceId: reservation.service_id,
      clientId: reservation.client_id
    }) : await cancelReservation({
      reservationId: reservation.id,
      serviceId: reservation.service_id,
      clientId: reservation.client_id
    })
    setRequestingCancel(false);
    await refresh();
  }

  return (
    <Card className={cn("shadow", isMobile ? "h-[133px] mb-1" : "h-[123px]")}>
      <CardContent className="px-0 pb-2">
        <CardHeader className="px-3 pt-2 pb-1">
          <CardTitle className="text-md flex gap-1 justify-start items-center">
            <Badge
            variant={
              reservation ? (reservation.status == "pending" ? "outline" : reservation.status == "accepted" ? "default" : "destructive") : "outline"
            }
            className={cn(
              "size-6 p-0 flex items-center justify-center", reservation ? reservation.status == "accepted" && "bg-green-600" : "*:bg-gray-200"
            )}>
              {reservation ? reservation.status == "pending" ? <Clock size={16} /> : reservation.status == "accepted" ? <Check size={16} /> : <X size={16} /> : <LayoutDashboard size={16} />}
            </Badge>

            {reservation ? formatDate(reservation.date, {
              month: "long",
              year: "numeric",
              day: "numeric",
              weekday: "long",
              locale: lang,
            }) : "--.--.--"}
          </CardTitle>
          <CardDescription className="flex flex-row items-center justify-between">
            <p className="text-nowrap w-fit flex gap-1" dir="ltr">
              {reservation ? formatTime(reservation.start_time, timeFormat) : "--:--"} 
              <span>-</span>
              {reservation ? formatTime(reservation.end_time, timeFormat) : "--:--"}
            </p>

            <div
              className="flex shrink-0 items-center gap-2 mb-2"
              dir="ltr"
            >
              <Switch
                id="time-format"
                checked={timeFormat === "24h"}
                onCheckedChange={(checked) =>
                  setTimeFormat(checked ? "24h" : "12h")
                }
                className="h-6 w-11 min-h-6 min-w-11 max-h-6 max-w-11 shrink-0"
              />
            </div>
          </CardDescription>
        </CardHeader>

        <div className="mx-1">
          <Button 
          variant="outline" 
          disabled={reservation?.status == "declined" || reservation?.status == "cancelled" || requestingCancel || reservation?.status == "cancel_requested"} 
          className="w-full"
          onClick={handleRequestCancel}
          >
            {requestingCancel && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {t(reservation?.status == "pending" ? "service.cancel" : "service.request_cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationCard;
