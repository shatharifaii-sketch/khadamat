import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useStripe from "@/hooks/use-stripe";
import { cn } from "@/lib/utils";
import { Home, LoaderCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useSearchParams } from "react-router-dom";

type PaymentState = 'idle' | 'loading' | 'success' | 'error';

const PaymentSuccess = () => {
  const { t } = useTranslation("subscriptions");
  const lang = localStorage.getItem("language") || "en";

  const [searchParams] = useSearchParams();
  const { verifySession, isVerifySessionSuccess } = useStripe();
  const sessionId = searchParams.get('session_id');

  const [state, setState] = useState<PaymentState>('idle');

  const [subscriptiondata, setSubscriptiondata] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const run = async () => {
      const data = await verifySession(sessionId);

      if (data) {
        setSubscriptiondata(data);
      }
    }

    run();
  }, [sessionId, verifySession]);

  useEffect(() => {
    if (!sessionId) return;

    const run = async () => {
      setState('loading');

      try {
        const result = await verifySession(sessionId);

        if (!result) {
          setState('error');
          return;
        }

        setSubscriptiondata(result);
        setState('success');
      } catch (err) {
        setState('error');
      }
    };

    run();
  }, [sessionId, verifySession]);

  if (!sessionId) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Home size={24} />
          </div>
          <img src="/application_logo_cut.png" className='h-12' alt="cut logo" />
        </Link>
      </div>

      {/* STATE: LOADING */}
      {state === 'loading' && (
        <LoaderCircle className="size-8 animate-spin" />
      )}

      {/* STATE: ERROR */}
      {state === 'error' && (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-semibold">{t("payment_success.error_title")}</p>
          <p>{t("payment_success.error_description")}</p>
          <Link to="/" className="underline text-blue-500">
            {t("payment_success.go_home")}
          </Link>
        </div>
      )}

      {/* STATE: SUCCESS */}
      {state === 'success' && subscriptiondata && (
        <>
          <div className="flex flex-col items-center gap-1 mb-3 text-center">
            <p className="font-semibold">{t("payment_success.success_title")}</p>
            <p>{t("payment_success.success_description")}</p>
            <Link to="/" className="underline text-blue-500">
              {t("payment_success.go_home")}
            </Link>
          </div>

          <Card className={cn(
            'w-full max-w-md',
            subscriptiondata.subscription_tier.class_name
          )}>
            <CardHeader className="text-center text-2xl font-bold">
              {subscriptiondata.subscription_tier.title}

              <span className="block mt-3">
                <Badge className={cn(
                  'flex items-center gap-2 w-fit mx-auto',
                  subscriptiondata.subscription_tier.badge_class_name
                )}>
                  <Star className="text-yellow-400" />
                  {t(subscriptiondata.subscription_tier.free_trial_period_text)}
                </Badge>
              </span>

              <span className="text-sm">
                {t("payment_success.available_services")}: {subscriptiondata.subscription_tier.allowed_services}
              </span>
            </CardHeader>

            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-3">
                <p className="font-medium mb-2">{t("payment_success.subscription_details_title")}:</p>

                <ul className="list-disc list-inside">
                  {((lang === "ar" ? subscriptiondata.subscription_tier.notes : subscriptiondata.subscription_tier.notes_english) ?? []).map((note: string) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PaymentSuccess