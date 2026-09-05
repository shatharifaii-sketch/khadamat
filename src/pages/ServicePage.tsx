import { useParams } from "react-router-dom";
import { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ServiceViewWrapper } from "@/components/Service/ServiceViewWrapper";
import ServiceLoading from "@/components/Service/ServiceLoading";
import Reviews from "@/components/Service/ui/Reviews";
import { Separator } from "@/components/ui/separator";
import LoadingReviews from "@/components/Service/ui/LoadingReviews";
import ReviewQueryError from "@/components/ErrorViews/ReviewQueryError";
import ServiceQueryError from "@/components/ErrorViews/ServiceQueryError";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DotIcon } from "lucide-react";

const ServicePage = () => {
  const { t } = useTranslation("services");
  const lang = localStorage.getItem("language") || "en";
  const isMobile = useIsMobile();
  const { id: serviceId } = useParams<{ id: string }>();

  if (!serviceId) {
    throw new Error("Service ID not found");
  }

  return (
    <div
      className={cn(
        isMobile
          ? "max-w-4xl mx-auto py-5 px-4 space-y-3"
          : "max-w-4xl mx-auto pt-5 pb-8 px-4 space-y-6",
      )}
    >
      <div className="flex items-center justify-start text-start" dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* <h1 className="md:text-2xl font-bold text-xl">
          {t("service.top_title")}
        </h1> */}
        <Breadcrumb className="bg-transparent" dir={lang === "ar" ? "rtl" : "ltr"}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-center flex items-center justify-center">
                {t("home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
          <DotIcon />
        </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/find-service" className="flex items-center justify-center">
                {t("find_services")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
          <DotIcon />
        </BreadcrumbSeparator>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Suspense fallback={<ServiceLoading />}>
        <ErrorBoundary fallback={<ServiceQueryError />}>
          <ServiceViewWrapper serviceId={serviceId} />
        </ErrorBoundary>
      </Suspense>
      <Separator />
      <Suspense fallback={<LoadingReviews />}>
        <ErrorBoundary fallback={<ReviewQueryError />}>
          <Reviews serviceId={serviceId} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

export default ServicePage;
