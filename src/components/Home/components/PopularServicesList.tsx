import EnhancedServiceCard from "@/components/FindService/EnhancedServiceCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useServices } from "@/hooks/useServices";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslation } from "react-i18next";

const PopularServicesList = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";
  const isMobile = useIsMobile();

  const { popularServices, isPopularServicesLoading, isPopularServicesError } =
    useServices();
  return (
    <div>
      {popularServices && popularServices.length > 0 ? (
        <div
          dir={lang === "ar" ? "rtl" : "ltr"}
          className={cn(
            "flex flex-row gap-2 overflow-x-auto scrollbar-hide py-5",
            lang === "ar"
              ? isMobile
                ? "px-5 gap-1"
                : "px-16"
              : isMobile
                ? "px-5 gap-1"
                : "px-16",
          )}
        >
          {popularServices.map((service) => (
            <EnhancedServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <p>{t("popular_services.empty")}</p>
      )}
    </div>
  );
};

export default PopularServicesList;
