import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useStripe from "@/hooks/use-stripe";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Home,
  LoaderCircle,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useSearchParams } from "react-router-dom";

type PaymentState = "idle" | "loading" | "success" | "error";

const ExtraServicePaymentSuccess = () => {
  const { t } = useTranslation("subscriptions");
  const lang = localStorage.getItem("language") || "en";

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { verifySession } = useStripe();

  const [state, setState] = useState<PaymentState>("idle");
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const run = async () => {
      setState("loading");

      try {
        const result = await verifySession(sessionId);

        if (!result) {
          setState("error");
          return;
        }

        setPaymentData(result);
        setState("success");
      } catch (error) {
        console.log(error);
        setState("error");
      }
    };

    run();
  }, [sessionId, verifySession]);

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 flex flex-col items-center justify-center px-4 py-12">
      {/* HEADER */}
      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 space-x-reverse mb-6"
        >
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-md">
            <Home size={24} />
          </div>

          <img
            src="/application_logo_cut.png"
            className="h-12"
            alt="cut logo"
          />
        </Link>
      </div>

      {/* LOADING */}
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="size-10 animate-spin text-primary" />

          <p className="text-muted-foreground">
            {t("payment_success.loading")}
          </p>
        </div>
      )}

      {/* ERROR */}
      {state === "error" && (
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="py-10 flex flex-col items-center text-center gap-4">
            <div className="bg-destructive/10 p-4 rounded-full">
              <ShoppingBag className="size-10 text-destructive" />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2">
                {t("payment_success.error_title")}
              </h2>

              <p className="text-muted-foreground">
                {t("payment_success.error_description")}
              </p>
            </div>

            <Link to="/">
              <Button variant="outline">
                {t("payment_success.go_home")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* SUCCESS */}
      {state === "success" && paymentData && (
        <div className="w-full max-w-lg">
          <Card className="border-green-200 shadow-2xl overflow-hidden">
            {/* TOP SECTION */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <CheckCircle2 className="size-14" />
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2">
                {t("payment_success.success_title")}
              </h1>

              <p className="text-white/90">
                {t("payment_success.success_description")}
              </p>
            </div>

            {/* CONTENT */}
            <CardContent className="p-6 space-y-6">
              {/* PRODUCT INFO */}
              <div className="border rounded-2xl p-5 bg-muted/40">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-5 text-primary" />

                  <h2 className="font-semibold text-lg">
                    {t("payment_success.extra_service_title")}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("payment_success.service_name")}
                    </span>

                    <span className="font-semibold">
                      {paymentData.product_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("payment_success.payment_amount")}
                    </span>

                    <Badge className="text-sm px-3 py-1">
                      {paymentData.amount} {paymentData.currency?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("payment_success.status")}
                    </span>

                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 border-green-200"
                    >
                      {t("payment_success.paid")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* SUCCESS BOX */}
              <div className="border border-dashed rounded-2xl p-5">
                <h3 className="font-semibold mb-3">
                  {t("payment_success.what_happens_next")}
                </h3>

                <ul
                  className={cn(
                    "space-y-2 text-sm text-muted-foreground",
                    lang === "ar"
                      ? "list-disc pr-5"
                      : "list-disc pl-5"
                  )}
                >
                  <li>
                    {t("payment_success.next_step_1")}
                  </li>

                  <li>
                    {t("payment_success.next_step_2")}
                  </li>

                  <li>
                    {t("payment_success.next_step_3")}
                  </li>
                </ul>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/post-service" className="flex-1">
                  <Button className="w-full">
                    {t("payment_success.post_service")}
                  </Button>
                </Link>

                <Link to="/account" className="flex-1">
                  <Button variant="outline" className="w-full">
                    {t("payment_success.go_to_account")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExtraServicePaymentSuccess;