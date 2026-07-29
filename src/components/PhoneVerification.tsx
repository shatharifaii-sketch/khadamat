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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Props {
  phone: { number: string; countryCode: string };
  password?: string;
}

const PhoneVerification = ({ phone, password }: Props) => {
  const { t } = useTranslation("auth");
  const lang = localStorage.getItem("language") || "en";
  const [loading, setLoading] = useState(false);
  
  const [resending, setResending] = useState<boolean>(false);
  const [codeResent, setCodeResent] = useState<boolean>(false);

  const navigate = useNavigate();

  const { verifyPhoneOtp, resendOtp } = useAuth();

  const [openResend, setOpenResend] = useState(false);
  const [otp, setOtp] = useState("");

  const startCooldown = () => {
    setResending(false);
    setCodeResent(false);
    setOpenResend(true);

    setTimeout(() => {
      setOpenResend(false);
    }, 60_000);
  };

  console.log(otp);

  useEffect(() => {
    startCooldown();
  }, []);

  const handleResend = async () => {
    // RESEND CODE
    setResending(true);

    const { success, error } = await resendOtp(`${phone.countryCode}${phone.number}`);

    if (success) setCodeResent(true);

    setResending(false);
    startCooldown();
    return;
  };

  const handleVerifyOtp = async (otp: string) => {
    if (otp.length != 6) return;
    setLoading(true);

    await verifyPhoneOtp(
      phone,
      otp,
      password
    ).then(() => {
      setLoading(false);
      navigate("/", { replace: true });
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-xl">{t("verify_phone.title")}</DialogTitle>
        <DialogDescription>
          {t("verify_phone.desc")}:{" "}
          <span className="font-medium" dir="ltr">
            +{phone.countryCode || "1"} {phone.number || "123456"}
          </span>
          .
        </DialogDescription>
      </DialogHeader>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="otp-verification">
            {t("verify_phone.label")}
          </FieldLabel>
          <Button
            variant="outline"
            disabled={!openResend}
            onClick={handleResend}
          >
            <RefreshCwIcon />
            {t("verify_phone.resend_code")}
          </Button>
        </div>
        <div dir="ltr">
          <InputOTP
            maxLength={6}
            id="otp-verification"
            value={otp}
            onChange={(value) => setOtp(value)}
            required
          >
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator className="mx-2" />
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </Field>

      <DialogFooter className="">
        <Button
          type="submit"
          className="flex-1"
          disabled={otp.length != 6 || loading}
          onClick={() => handleVerifyOtp(otp)}
        >
          Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PhoneVerification;
