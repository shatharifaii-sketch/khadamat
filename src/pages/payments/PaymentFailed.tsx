import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PaymentFailed = () => {
  const { t } = useTranslation("subscriptions");
  const lang = localStorage.getItem("language") || "en";

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
          <img src="/application_logo_cut.png" className="h-12" alt="logo" />
        </Link>
      </div>

      {/* CARD */}
      <Card className="w-full max-w-md border-red-200 shadow-xl overflow-hidden">
        {/* TOP SECTION */}
        <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <AlertTriangle className="size-14" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {t("payment_failed.title")}
          </h1>

          <p className="text-white/90">
            {t("payment_failed.description")}
          </p>
        </div>

        {/* CONTENT */}
        <CardContent className="p-6 space-y-6">

          {/* ACTIONS */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="w-full">
              <Button className="w-full">
                <Home className="mr-2 size-4" />
                {t("payment_failed.back_home")}
              </Button>
            </Link>

            <Link to="/pricing" className="w-full">
              <Button variant="outline" className="w-full">
                <RefreshCcw className="mr-2 size-4" />
                {t("payment_failed.try_again")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;