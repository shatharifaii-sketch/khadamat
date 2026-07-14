import React, { useEffect, useState } from 'react'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Field, FieldLabel } from './ui/field'
import { Button } from './ui/button'
import { RefreshCwIcon } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './ui/input-otp'
import { useTranslation } from 'react-i18next'

interface Props {
    phone: {number: string, countryCode: string};
}

const PhoneVerification = ({
    phone
}: Props) => {
    const { t } = useTranslation("auth.verify_phone");
    const lang = localStorage.getItem("language") || "en";

    const [openResend, setOpenResend] = useState(false);


    useEffect(() => {
      if (openResend) {
        setTimeout(() => {
          setOpenResend(false);
        }, 3000);
      }
    });

    
  return (
    <DialogContent className="sm:max-w-[425px]" dir={lang === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-xl">{t("Verify your login")}</DialogTitle>
            <DialogDescription>
              Enter the verification code we sent to your phone number:{" "}
              <span className="font-medium">
                +{phone.countryCode || "1"} {phone.number || "123456"}
              </span>.
            </DialogDescription>
          </DialogHeader>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>
              <Button variant="outline" disabled={openResend}>
                <RefreshCwIcon />
                Resend Code
              </Button>
            </div>
            <InputOTP maxLength={6} id="otp-verification" required>
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
          </Field>

          <DialogFooter className="">
            <Button type="submit" className="flex-1">Submit</Button>
          </DialogFooter>
        </DialogContent>
  )
}

export default PhoneVerification