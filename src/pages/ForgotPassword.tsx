import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmail } from "@/hooks/useEmail";
import { useProfile } from "@/hooks/useProfile";
import { Home } from "lucide-react"
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner";

type FormError = {
  message: string,
  field: string
}

const ForgotPassword = () => {
  const { t } = useTranslation("auth");
  const lang = localStorage.getItem("language") || "en";

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ message: string, field: string }[]>([]);

  const { sendPasswordUpdateEmail } = useEmail();


  const handleResetPassword = async () => {
    // Perform password reset logic here
    console.log('Password reset email sent to:', email);

    try {
      await sendPasswordUpdateEmail.mutateAsync({ email });
    } catch (e) {
      // optionally log internally
    } finally {
      toast.success(t("forgot_password_page.success_message"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 arabic">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home size={24} />
            </div>
            <img src="/application_logo_cut.png" className='h-10' alt="cut logo" />
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t("forgot_password_page.title")}
            </CardTitle>
            <CardDescription>
              {t("forgot_password_page.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-3">
              {t("forgot_password_page.helper_text")}
            </p>
            <div className="space-y-2 mb-3">
              <Label htmlFor="email">{t("forgot_password_page.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="info@khedemtak.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              onClick={handleResetPassword}
              disabled={sendPasswordUpdateEmail.isPending}
            >
              {t("forgot_password_page.submit_button")}
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword