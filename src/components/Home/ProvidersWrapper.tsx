import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import ErrorBoundary from "../ErrorBoundary";
import ProvidersList, {
  ProvidersLoadingSkeleton,
} from "./components/ProvidersList";
import { useIsMobile } from "@/hooks/use-mobile";

const ProvidersWrapper = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";

  const isMobile = useIsMobile();
  return (
    <div className="lg:w-4/6 mx-auto px-3 sm:px-5 md:px-10 py-7" dir={lang === "ar" ? "rtl" : "ltr"}>
      <p className="text-lg md:text-2xl font-semibold text-start">
        {t("active_providers.title")}
      </p>
      <p className="text-sm md:text-md text-start text-muted-foreground">
        {t("active_providers.description")}
      </p>
      <div className="my-2 border-t border-muted-foreground/20" />
      <Suspense
        fallback={<ProvidersLoadingSkeleton lang={lang} isMobile={isMobile} />}
      >
        <ErrorBoundary>
          <ProvidersList />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

export default ProvidersWrapper;
