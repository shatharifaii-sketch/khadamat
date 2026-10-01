import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useStripe from "@/hooks/use-stripe";
import { cn } from "@/lib/utils";
import { CheckCircle2, Home, LoaderCircle, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useSearchParams } from "react-router-dom";

type PaymentState = 'idle' | 'loading' | 'success' | 'error';

const ExtraServicePaymentSuccess = () => {
  const { t } = useTranslation("subscriptions");
  const lang = localStorage.getItem("language") || "en";

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { verifyExtraSession, isVerifyExtraSessionSuccess } = useStripe();

  const [state, setState] = useState<PaymentState>('idle');

  // Replace this with your real verification logic
  useEffect(() => {
    if (!sessionId) return;

    const run = async () => {
      setState('loading');

      try {
        const state = await verifyExtraSession(sessionId);

        if (state) {
          setState('success');
        }
      } catch {
        setState('error');
      }
    };

    run();
  }, [sessionId, verifyExtraSession]);

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-4 space-x-reverse mb-6"
        >
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
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
      {state === 'loading' && (
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="size-8 animate-spin" />
          <p className="text-muted-foreground">
            {t("extra_payment_success.loading_title")}
          </p>
        </div>
      )}

      {/* ERROR */}
      {state === 'error' && (
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center space-y-4">
            <p className="text-xl font-semibold text-red-500">
              {t("extra_payment_success.error_title")}
            </p>

            <p className="text-muted-foreground">
              {t("extra_payment_success.error_description")}
            </p>

            <Link to="/">
              <Button className="w-full">
                {t("extra_payment_success.back_home")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* SUCCESS */}
      {state === 'success' && (
        <Card className={cn("w-full max-w-lg border-green-200")}>
          <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="size-12 text-green-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-green-700">
                {t("extra_payment_success.success_title")}
              </h1>

              <p className="text-muted-foreground mt-2">
                {t("extra_payment_success.success_description")}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-start gap-3">
                <PlusCircle className="size-5 mt-1 text-primary" />

                <div>
                  <p className="font-semibold mb-1">
                    {t("extra_payment_success.what_happened_title")}
                  </p>

                  <p className="text-sm text-muted-foreground leading-6">
                    {t("extra_payment_success.what_happened_description")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/post-service">
                <Button className="w-full">
                  {t("extra_payment_success.post_new_service")}
                </Button>
              </Link>

              <Link to="/account">
                <Button variant="outline" className="w-full">
                  {t("extra_payment_success.go_to_account")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExtraServicePaymentSuccess;