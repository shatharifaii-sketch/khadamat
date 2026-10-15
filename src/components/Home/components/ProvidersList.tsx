import { useProviderProfiles } from "@/hooks/useProfile";
import { useTranslation } from "react-i18next";
import TopProviderCardComponent from "./TopProviderCardComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const ProvidersLoadingSkeleton = ({
  lang,
  isMobile,
}: {
  lang: string;
  isMobile: boolean;
}) => {
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
      {[...Array(5)].map((_, index) => (
        <Skeleton key={index} className="h-71 min-w-52 rounded-md mb-4" />
      ))}
    </div>
  );
};

const ProvidersList = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";

  const isMobile = useIsMobile();

  const { providers, isLoading, isError } = useProviderProfiles();

  if (isLoading) {
    return <ProvidersLoadingSkeleton lang={lang} isMobile={isMobile} />;
  }

  if (isError) {
    return <p>{t("active_providers.error")}</p>;
  }
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
      {providers && providers.length > 0 ? (
        providers?.map((provider) => (
          <TopProviderCardComponent key={provider.id} provider={provider} />
        ))
      ) : (
        <p>{t("active_providers.no_providers_yet")}</p>
      )}
    </div>
  );
};

export default ProvidersList;
