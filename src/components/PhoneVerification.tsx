import React, { useEffect, useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Field, FieldLabel } from "./ui/field";
import { Button } from "./ui/button";
import { RefreshCwIcon } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  phone: {
    number: string;
    countryCode: string;
  };
  password?: string;
}

const RESEND_COOLDOWN = 60;

const PhoneVerification = ({ phone, password }: Props) => {
  const { t } = useTranslation("auth");

  const navigate = useNavigate();

  const { verifyPhoneOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);

  const [attempts, setAttempts] = useState(0);

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

  const maskPhoneNumber = (countryCode: string, number: string) => {
    if (!number) return "";

    const visibleStart = 3;
    const visibleEnd = 2;

    if (number.length <= visibleStart + visibleEnd) {
      return `+${countryCode} ${"*".repeat(number.length)}`;
    }

    const masked =
      number.slice(0, visibleStart) +
      "*".repeat(number.length - visibleStart - visibleEnd) +
      number.slice(-visibleEnd);

    return `+${countryCode} ${masked}`;
  };

  const handleResend = async () => {
    if (!canResend || resending) return;

    try {
      setResending(true);

      const { success, error } = await resendOtp(
        `${phone.countryCode}${phone.number}`,
      );

      if (!success) {
        throw error;
      }

      if (typeof error === "string" && error == "Too many requests. Please wait a minute before trying again.") {
        toast.error(t("verify_phone.too_many_requests"));
      }

      toast.success(t("verify_phone.code_sent"));

      startCooldown();
    } catch (error: unknown) {
      console.error(error);

      toast.error(error instanceof Error ? error.message : t("verify_phone.resend_failed"));
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || loading) return;

    /**
     * Client-side protection.
     * Supabase also has server-side limits.
     */
    if (attempts >= 5) {
      toast.error(t("verify_phone.too_many_attempts"));

      return;
    }

    try {
      setLoading(true);
      setAttempts((prev) => prev + 1);

      await verifyPhoneOtp(phone, otp, password);

      navigate("/", {
        replace: true,
      });
    } catch (error: unknown) {
      console.error(error);

      toast.error(error instanceof Error ? error.message : t("verify_phone.invalid_code"));

      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-xl">{t("verify_phone.title")}</DialogTitle>

        <DialogDescription>
          {t("verify_phone.desc")}{" "}
          <span className="font-medium" dir="ltr">
            {maskPhoneNumber(phone.countryCode, phone.number)}
          </span>
        </DialogDescription>
      </DialogHeader>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="otp-verification">
            {t("verify_phone.label")}
          </FieldLabel>

          <Button
            variant="outline"
            disabled={!canResend || resending}
            onClick={handleResend}
          >
            <RefreshCwIcon className={resending ? "animate-spin" : ""} />

            {canResend ? t("verify_phone.resend_code") : `${secondsLeft}s`}
          </Button>
        </div>

        <div dir="ltr">
          <InputOTP
            maxLength={6}
            id="otp-verification"
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup
              className="
              *:data-[slot=input-otp-slot]:h-12
              *:data-[slot=input-otp-slot]:w-11
              *:data-[slot=input-otp-slot]:text-xl
              "
            >
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </Field>

      <DialogFooter>
        <Button
          className="flex-1"
          disabled={otp.length !== 6 || loading}
          onClick={handleVerifyOtp}
        >
          {loading ? t("verify_phone.verifying") : t("verify_phone.submit")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PhoneVerification;
