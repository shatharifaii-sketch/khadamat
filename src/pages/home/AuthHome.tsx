import ErrorBoundary from "@/components/ErrorBoundary";
import PopularServicesWrapper from "@/components/Home/PopularServicesWrapper";
import TopCategoriesWrapper from "@/components/Home/TopCategoriesWrapper";
import SubscriptionsModal from "@/components/PostService/SubscriptionsModal";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import React, { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";

const AuthHome = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";
  const isMobile = useIsMobile();

  const { user } = useAuth();
  const { hasSubscription } = useSubscription();

  const [openSubscribeModal, setOpenSubscribeModal] = useState(false);

  return (
    <>
      <section className="" dir={lang === "ar" ? "rtl" : "ltr"}>
        {!hasSubscription && (
          <div className="px-3 py-1 bg-primary">
            <div className="flex justify-between items-center text-sm w-full lg:w-1/2 lg:mx-auto">
              <div className="flex gap-2 justify-start items-center text-muted">
                <p className={cn("text-nowrap", isMobile && "text-xs")}>
                  {t("auth.welcome_message")}
                </p>
                <p className={cn("text-nowrap", isMobile && "hidden")}>
                  {t("auth.description")}
                </p>
              </div>

              <Button
                variant="outline"
                className={cn("text-primary text-xs")}
                size="sm"
                onClick={() => setOpenSubscribeModal(true)}
              >
                <Star className="size-4 priamry" />
                {t("auth.become_member")}
              </Button>
            </div>
          </div>
        )}

        <PopularServicesWrapper />
      </section>

      <section>
        <TopCategoriesWrapper />
      </section>

      <Drawer
        direction={lang === "ar" ? "right" : "left"}
        open={openSubscribeModal}
        onOpenChange={() => setOpenSubscribeModal(false)}
      >
        <DrawerContent className="max-w-2xl h-full">
          <DrawerDescription className="flex flex-col gap-4 px-5 overflow-y-auto">
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <SubscriptionsModal
                  setDrawerOpen={() => setOpenSubscribeModal(false)}
                  user={user}
                />
              </ErrorBoundary>
            </Suspense>
          </DrawerDescription>
          <DrawerFooter>
            <DrawerClose className="flex">
              <Button variant="ghost" className="flex-1">
                {t("subscriptions.drawer.close")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AuthHome;
