import ErrorBoundary from "@/components/ErrorBoundary";
import UserProfileQueryError from "@/components/ErrorViews/UserProfileQueryError";
import ProfileLoading from "@/components/Profile/ProfileLoading";
import ProfileView from "@/components/Profile/ProfileView";
import ProfileViewWrapper from "@/components/Profile/ProfileViewWrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublisherProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { DotIcon, EllipsisVertical } from "lucide-react";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

const UserProfilePage = () => {
  const { t } = useTranslation("profile");
  const lang = localStorage.getItem("language") || "en";

  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { id: userId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const serviceId = searchParams.get("serviceId");

  if (!userId) {
    throw new Error("User ID not found");
  }

  if (user?.id === userId) {
    return <Navigate to="/account" />;
  }

  return (
    <div 
    className={cn(
            isMobile
              ? "max-w-4xl mx-auto py-5 px-4 space-y-3"
              : "max-w-4xl mx-auto pt-5 pb-8 px-4 space-y-6",
          )}
    >
      <Breadcrumb
        className="bg-transparent"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/"
                className="flex items-center justify-center text-center"
              >
                {t("home")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <DotIcon />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/find-service"
                className="flex items-center justify-center"
              >
                {t("find_services")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <DotIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to={`/find-service/${serviceId}`}
                className="flex items-center justify-center"
              >
                {t("service")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <DotIcon />
          </BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>
      <Suspense fallback={<ProfileLoading />}>
        <ErrorBoundary fallback={<UserProfileQueryError />}>
          <ProfileViewWrapper userId={userId} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

export default UserProfilePage;
