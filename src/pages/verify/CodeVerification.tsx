import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Home, RefreshCwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Form = {
  email: string;
  password: string;
};

const RESEND_COOLDOWN = 60;

function ResendVerificationEmail({
  resendCode,
  formData,
}: {
  resendCode: (
    email: string | null,
    password: string,
    phone: { countryCode: string; number: string } | null,
    method: string,
  ) => Promise<{ error: unknown; data: string | unknown }>;
  formData: Form;
}) {
  const { t } = useTranslation("auth");
  const [resending, setResending] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);

  const canResend = secondsLeft === 0;

  /**
   * Start resend countdown
   */
  const startCooldown = () => {
    setSecondsLeft(RESEND_COOLDOWN);
  };

  /**
   * Countdown timer
   */
  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  /**
   * Start cooldown on mount
   */
  useEffect(() => {
    startCooldown();
  }, []);

  if (!formData.email || !formData.password) {
    return (
      <div className="my-1">
        <p className="text-sm text-destructive">Unexpected Bug</p>
      </div>
    );
  }

  const handleResend = async () => {
    if (!canResend || resending) return;

    try {
      setResending(true);

      const res = await resendCode(
        formData.email,
        formData.password,
        null,
        "email",
      );

      if (res.data == "otp_sent") {
        toast.success(t("otp_sent"));
      }

      startCooldown();
    } catch (error: unknown) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : t("code_verification.resend_failed"),
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-end">
      <Button
        variant="outline"
        disabled={!canResend || resending}
        onClick={handleResend}
      >
        <RefreshCwIcon className={resending ? "animate-spin" : ""} />

        {canResend ? t("code_verification.resend_code") : `${secondsLeft}s`}
      </Button>
    </div>
  );
}

const CodeVerification = () => {
  const { t } = useTranslation("auth");
  const lang = localStorage.getItem("language") || "en";

  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, signIn } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");

  const state = location.state as {
    function: string;
    email: string;
    password: string;
  };

  useEffect(() => {
    if (code.length > 6) {
      setError(t("code_verification.error_too_long"));
    }
  }, [code, t]);

  if (!state || !state.email) {
    navigate('/', { replace: true });
    return null;
  }

  if (code.length > 6) setCode(code.slice(0, 6));

  const handleVerify = async () => {
    setVerifying(true)
    if (code.length < 6) {
      toast.error(t("code_verification.short_code"))

      return;
    }

    if (attempts >= 5) {
      toast.error(t("code_verification.too_many_attempts"));

      return;
    }

    try {
      setAttempts((prev) => prev + 1);
      const { error } = await verifyOtp(state.email, code);

      if (error) {
        setError(
          error instanceof Error ? error.message : JSON.stringify(error),
        );
        return;
      }

      setVerifying(false)
      navigate("/", { replace: true });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Unknown Error!");
    } finally {
      setVerifying(false)
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 arabic">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 space-x-reverse mb-6"
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

        <Card>
          <CardHeader>
            <CardTitle>{t("code_verification.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {t("code_verification.description")}
            </CardDescription>
            <Input
              type="text"
              value={code}
              placeholder={t("code_verification.input_placeholder")}
              onChange={(e) => setCode(e.target.value)}
              className="mt-4"
            />
            <p className="text-red-500 text-sm mt-1 mr-1">{error}</p>

            <ResendVerificationEmail
              resendCode={signIn}
              formData={{
                email: state.email,
                password: state.password
              }}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleVerify} className="flex-1">
              {t("code_verification.button")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CodeVerification;
