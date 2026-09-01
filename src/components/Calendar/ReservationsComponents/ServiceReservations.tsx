import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ReservationList } from "@/contexts/ReservationsContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ReservationCard from "./ReservationCard";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CircleCheck, CircleX, Clock8 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CreateReservationForm from "./CreateReservationForm";

interface Props {
  reservations: ReservationList[];
  canReserve: boolean;
  latestReservation: ReservationList;
  serviceId: string;
  providerId: string;
  userId: string;
}

const ServiceReservations = ({
  reservations,
  canReserve,
  latestReservation,
  serviceId,
  providerId,
  userId,
}: Props) => {
  const { t } = useTranslation();
  const lang = localStorage.getItem("language") || "en";

  const [selectedRes, setSelectedRes] = useState<ReservationList | null>(
    latestReservation,
  );
  const [makingRes, setMakingRes] = useState<boolean>(false);

  const isMobile = useIsMobile();

  const reservationsSlots = [
    ...reservations.slice(0, 4),
    ...Array(Math.max(0, 4 - reservations.length)).fill(null),
  ];

  return (
    <div
      className={cn(
        "border-2 rounded-md border-dashed mt-5 px-2 py-2",
        isMobile ? "h-fit" : "h-36",
      )}
      dir={lang == "ar" ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "grid",
          isMobile
            ? "grid-cols-1 gap-3"
            : "grid-cols-2 items-start justify-between",
        )}
      >
        <div className="text-start">
          <h3 className="text-lg font-semibold">
            {t("service.with_appointments")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("service.with_appointments_description")}
          </p>

          <Dialog open={makingRes} onOpenChange={setMakingRes}>
            <DialogTrigger asChild>
              <Button
                disabled={canReserve}
                className={cn("mt-3", isMobile && "hidden")}
              >
                {t("service.make_reservation")}
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <div className="text-start h-full">
          {reservations.length > 0 ? (
            <div
              className={cn(
                "grid gap-1",
                isMobile
                  ? "grid-cols-1 grid-rows-3"
                  : "grid-cols-3 grid-rows-2",
              )}
            >
              {selectedRes && (
                <div
                  className={cn(
                    "",
                    isMobile ? "col-span-1 row-span-2" : "col-span-2",
                  )}
                >
                  <ReservationCard
                    key={selectedRes.id}
                    reservation={selectedRes}
                  />
                </div>
              )}

              <div
                className={cn(
                  "grid gap-1",
                  isMobile
                    ? "grid-cols-4 grid-rows-1"
                    : "grid-cols-2 grid-rows-2",
                )}
              >
                {reservationsSlots.map((res, index) => (
                  <Card
                    key={res?.id ?? `empty-${index}`}
                    className={cn(
                      "transition-opacity",
                      res
                        ? "cursor-pointer opacity-80 hover:opacity-100"
                        : "cursor-not-allowed opacity-40",
                      res?.id === selectedRes?.id &&
                        "bg-primary/70 border-primary opacity-100",
                    )}
                    onClick={() => {
                      if (res) {
                        setSelectedRes(res);
                      }
                    }}
                  >
                    <CardContent className="flex flex-col items-center justify-center px-0 pb-1">
                      <p className="text-sm text-muted-foreground">
                        <Calendar size={16} className="my-0.5" />
                      </p>

                      <Separator className="mb-1" />

                      {res ? (
                        res.status === "pending" ? (
                          <Clock8 className="text-muted-foreground" />
                        ) : res.status === "accepted" ? (
                          <CircleCheck className="text-green-600" />
                        ) : (
                          <CircleX className="text-destructive" />
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-muted w-full h-32 rounded-sm border-2 border-dashed flex items-center justify-center">
              <p className="text-muted-foreground font-lighter">
                {t("service.no_reservations")}
              </p>
            </div>
          )}

          <Dialog open={makingRes} onOpenChange={setMakingRes}>
            <DialogTrigger asChild>
              <Button
                disabled={canReserve}
                className={cn("mt-3 w-full", !isMobile && "hidden")}
              >
                {t("service.make_reservation")}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <CreateReservationForm
                serviceId={serviceId}
                providerId={providerId}
                userId={userId}
                onSuccess={() => setMakingRes(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ServiceReservations;
