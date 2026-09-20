import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn, isMobile } from "@/lib/utils";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Star } from "lucide-react";
import { useSubscriptionTiers } from "@/hooks/useSubscriptionTiers";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "../ui/drawer";
import useStripe from "@/hooks/use-stripe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { User } from "../Admin/ui/UserForm";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface SubscriptionsModalProps {
  cardClassName?: string;
  switchClassName?: string;
  user?: User;
  setDrawerOpen?: (isOpen: boolean) => void;
  asDrawer?: boolean;
}

interface SubscriptionCardProps {
  subscription: any;
  yearly: boolean;
  selectedSubscription: any;
  cardClassName?: string;
  onSelect: (sub: any) => void;
  onNavigate: (priceId: string) => void;
  isCreatingCheckoutSessionPending: boolean;
  setDrawerOpen?: (isOpen: boolean) => void;
  success: boolean;
}

const SubscriptionCard = ({
  subscription,
  yearly,
  selectedSubscription,
  cardClassName,
  onSelect,
  onNavigate,
  isCreatingCheckoutSessionPending,
  setDrawerOpen,
  success,
}: SubscriptionCardProps) => {
  const { t } = useTranslation("subscriptions");
  const lang = localStorage.getItem("language") || "en";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (success) {
      setOpen(false);
    }
  }, [success]);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden flex flex-col justify-between",
        "rounded-2xl border-2 transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl",
        subscription.class_name,
        cardClassName,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1.5",
          subscription.badge_class_name,
        )}
      />

      <CardHeader className="pt-7 pb-4 text-center">
        <CardTitle className="text-xl md:text-2xl font-bold">
          {subscription?.title}
        </CardTitle>
        <div className="mt-3 flex justify-center">
          <Badge
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold",
              "shadow-sm",
              subscription.badge_class_name,
            )}
          >
            <Star className="mr-1.5 h-4 w-4 fill-current" />
            {t(subscription.free_trial_period_text)}
          </Badge>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          {t("available_services")}{" "}
          <span className="font-semibold text-foreground">
            {subscription.allowed_services}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-muted/40 p-4 text-center">
          <p className="mb-1 text-sm text-muted-foreground">
            {yearly ? t("yearly") : t("monthly")}
          </p>

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl md:text-4xl font-bold">
              {yearly
                ? subscription.price_yearly_value
                : subscription.price_monthly_value}
            </span>

            <span className="text-sm text-muted-foreground">
              {yearly ? t("yearly_ils") : t("monthly_ils")}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => onSelect(subscription)}
              variant="default"
              className="w-full rounded-xl h-11 text-base font-semibold shadow-md transition-all group-hover:shadow-lg"
              disabled={isCreatingCheckoutSessionPending}
            >
              {t("subscribe")}
            </Button>
          </DialogTrigger>
          <DialogContent
  className={cn(
    "rounded-2xl",
  )}
>
  <DialogHeader className="text-center">
    <DialogTitle className="text-lg md:text-xl">
      {t("payment_gateway_title")}
    </DialogTitle>

    <DialogDescription className="text-sm">
      {t("payment_gateway_description")}
    </DialogDescription>
  </DialogHeader>

  {selectedSubscription && (
    <div
      className={cn(
        "rounded-2xl border-2 p-5 max-h-[400px] overflow-y-auto",
        selectedSubscription.class_name
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xl font-bold">
            {selectedSubscription.title}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("available_services")}{" "}
            {selectedSubscription.allowed_services}
          </p>
        </div>

        <Badge
          className={cn(
            "rounded-full",
            selectedSubscription.badge_class_name,
          )}
        >
          <Star className="mr-1 h-4 w-4 fill-current" />
          {t(selectedSubscription.free_trial_period_text)}
        </Badge>
      </div>

      <div className="my-5 h-px bg-border" />

      <div className="flex items-end justify-between">
        <span className="text-sm text-muted-foreground">
          {yearly ? t("yearly") : t("monthly")}
        </span>

        <div className="text-right">
          <span className="text-3xl font-bold">
            {yearly
              ? selectedSubscription.price_yearly_value
              : selectedSubscription.price_monthly_value}
          </span>

          <span className="ml-1 text-sm text-muted-foreground">
            {yearly
              ? t("yearly_ils")
              : t("monthly_ils")}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-muted/50 p-4">
        <p className="mb-2 text-sm font-semibold">
          {t("important_points")}
        </p>

        <ul className="space-y-2 text-sm text-muted-foreground">
          {lang === "ar" &&
            (selectedSubscription.notes ?? []).map(
              (note: string) => (
                <li
                  className="flex gap-2 text-start"
                  key={note}
                >
                  <span>•</span>
                  <span>{note}</span>
                </li>
              ),
            )}

          {lang === "en" &&
            (selectedSubscription.notes_english ?? []).map(
              (note: string) => (
                <li
                  className="flex gap-2 text-start"
                  key={note}
                >
                  <span>•</span>
                  <span>{note}</span>
                </li>
              ),
            )}
        </ul>
      </div>
    </div>
  )}

  <DialogFooter>
    <Button
      onClick={() =>
        onNavigate(
          yearly
            ? selectedSubscription.stripe_yearly_price_id
            : selectedSubscription.stripe_monthly_price_id,
        )
      }
      className="w-full h-11 rounded-xl text-base font-semibold"
      disabled={isCreatingCheckoutSessionPending}
    >
      {t("go_to_payment_gateway")}
    </Button>
  </DialogFooter>
</DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

const SubscriptionsModal = ({
  cardClassName,
  switchClassName,
  user,
  setDrawerOpen,
  asDrawer = true,
}: SubscriptionsModalProps) => {
  const { t } = useTranslation("subscriptions");
  const lang = localStorage.getItem("language") || "en";

  const [yearly, setYearly] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const navigate = useNavigate();

  const { subscriptionTiersData } = useSubscriptionTiers();
  const {
    createCheckoutSession,
    isCreatingCheckoutSessionPending,
    isCreateCheckoutSessionSuccess,
  } = useStripe();

  const handleSubscriptionSelect = (subscriptionTier: any) => {
    setSelectedSubscription(subscriptionTier);
  };

  const handleNavigationToPaymentWindow = (price_id: string) => {
    if (!user) {
      toast.error(t("login_required"));
      return navigate("/auth");
    }
    const res = createCheckoutSession({
      priceId: price_id,
      userId: user.id,
      email: user.email,
    });

    setDrawerOpen?.(false);
  };

  const HeaderWrapper = asDrawer ? DrawerHeader : "div";
  const TitleWrapper = asDrawer ? DrawerTitle : "h2";
  const DescWrapper = asDrawer ? DrawerDescription : "div";

  return (
    <>
      <HeaderWrapper className="flex items-center justify-between">
        <TitleWrapper
          className={cn(
            "text-lg md:text-2xl w-full",
            asDrawer ? "text-start" : "text-center",
          )}
        >
          {t("title")}
        </TitleWrapper>
      </HeaderWrapper>
      <DescWrapper className="flex flex-col gap-5 px-4 sm:px-6 overflow-y-auto">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm md:text-base text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="rounded-2xl border bg-gradient-to-b from-muted/40 to-background p-5 lg:p-6">
          <div className="text-center mb-6">
            <p className="text-xl font-bold">{t("choose_plan")}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("select_payment_plan")}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border bg-background p-1 shadow-sm">
              <span
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  yearly
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {t("yearly")}
              </span>

              <Switch
                checked={yearly}
                onCheckedChange={setYearly}
                className="h-6 w-11 shrink-0"
                dir="ltr"
              />

              <span
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  !yearly
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {t("monthly")}
              </span>
            </div>

            <div className="mt-4 rounded-full bg-primary/10 px-4 py-2">
              <p className="text-sm font-medium text-primary">
                {t("start_for_free")}
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 w-full gap-5">
            {(subscriptionTiersData ?? []).map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                yearly={yearly}
                selectedSubscription={selectedSubscription}
                cardClassName={cardClassName}
                onSelect={handleSubscriptionSelect}
                onNavigate={handleNavigationToPaymentWindow}
                isCreatingCheckoutSessionPending={
                  isCreatingCheckoutSessionPending
                }
                setDrawerOpen={setDrawerOpen}
                success={isCreateCheckoutSessionSuccess}
              />
            ))}
          </div>

          <div className="mt-6 space-y-1 text-center text-xs text-muted-foreground">
            <p>{t("auto_renew_notice")}</p>
            <p>{t("payment_notification_notice")}</p>
          </div>
        </div>
      </DescWrapper>
    </>
  );
};

export default SubscriptionsModal;
