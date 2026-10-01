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
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const TopCategoriesList = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";

  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { data: homeStats, isLoading, error } = useHomeStats();
  const categoriesWithServices =
  [...(homeStats?.categoriesWithServices ?? [])]
    .filter((service) => service.category !== "other")
    .sort((a, b) => b.count - a.count);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollLeft += lang === "ar" ? -e.deltaY : e.deltaY;
  };

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
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
      {categoriesWithServices.map((category, index) => {
        const Icon =
          categories.find((cat) => cat.value === category.category)?.icon ||
          MoreHorizontal;
        const displayName =
          categories.find((cat) => cat.value === category.category)?.label ||
          category.category;

        return (
          <Card
            key={index}
            role="link"
            tabIndex={0}
            className="
      group
      min-w-36 sm:min-w-40
      border-border/60
      bg-card
      transition-all duration-200
      hover:-translate-y-1
      hover:border-primary/40
      hover:shadow-md
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-primary
      focus-visible:ring-offset-2
    "
            onClick={() => {
              navigate(`/find-service?category=${category.category}`);
            }}
          >
            <CardHeader className="p-4 text-center">
              <div
                className="
          mx-auto mb-3
          flex size-12
          items-center justify-center
          rounded-xl
          bg-primary/10
          text-primary
          transition-colors
          group-hover:bg-primary/15
        "
              >
                <Icon className="size-6" />
              </div>

              <CardTitle className="line-clamp-1 text-sm font-semibold">
                {t(displayName)}
              </CardTitle>

              <CardDescription className="mt-1 text-xs">
                {t(
                  category.count > 1
                    ? "services.service_count"
                    : "services.service_count_single",
                  { count: category.count },
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};

export default TopCategoriesList;
