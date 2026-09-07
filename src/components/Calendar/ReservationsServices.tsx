import { useAuth } from "@/contexts/AuthContext";
import useReservations from "@/hooks/useReservations";
import React from "react";
import { useTranslation } from "react-i18next";
import ResServiceCard from "./ReservationsComponents/ResServiceCard";

const ReservationsServices = () => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";

  const { user } = useAuth();

  const {
    reservationsServices,
    isReservationsServicesError,
    isReservationsServicesLoading,
  } = useReservations({
    providerId: user?.id,
  });

  console.log(reservationsServices);

  return (
    <div
      className="text-start flex flex-col gap-3 w-full"
      dir={lang == "en" ? "ltr" : "rtl"}
    >
      <div className="w-full">
        <h3 className="text-sm md:text-xl">{t("services.title")}</h3>
        <p className="text-muted-foreground text-sm">
          {t("services.description")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {reservationsServices.map((rs) => (
          <ResServiceCard key={rs.id} service={rs} />
        ))}
      </div>
    </div>
  );
};

export default ReservationsServices;
