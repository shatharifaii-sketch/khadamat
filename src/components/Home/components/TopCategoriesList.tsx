import { categories } from "@/components/FindService/ServiceCategories";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHomeStats } from "@/hooks/useHomeStats";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const TopCategoriesList = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";

  const isMobile = useIsMobile();

  const { data: homeStats, isLoading, error } = useHomeStats();
  const categoriesWithServices =
    homeStats?.categoriesWithServices.sort((a, b) => b.count - a.count) || [];

  console.log("TopCategoriesList - homeStats:", categoriesWithServices);
  return (
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
      {categoriesWithServices.map((service, index) => {
        const Icon =
          categories.find((cat) => cat.value === service.category)?.icon ||
          MoreHorizontal;
        const displayName =
          categories.find((cat) => cat.value === service.category)?.label ||
          service.category;

        return (
          <Link
            key={index}
            to={`/find-service?category=${service.category}`}
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full min-w-42">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 bg-primary/10 rounded-full mb-1 md:mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Icon className="size-6 md:size-8 text-primary" />
                </div>
                <CardTitle className="text-sm md:text-xl">
                  {t(displayName)}
                </CardTitle>
                <CardDescription className="text-xs md:text-large">
                  {t(
                    service.count > 1
                      ? "services.service_count"
                      : "services.service_count_single",
                    { count: service.count },
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default TopCategoriesList;
