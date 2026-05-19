import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { Home } from "lucide-react"
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom"

type FormError = {
  message: string,
  field: string
}

const ResetPassword = () => {
  const { t } = useTranslation("auth");
  const lang = localStorage.getItem("language") || "en";

  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ message: string, field: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const { changePassword } = useProfile();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const validate = (): FormError[] => {
    const newErrors: FormError[] = [];

    if (!formData.newPassword) {
      newErrors.push({
        field: 'newPassword',
        message: t("reset_password_page.errors.new_password_required")
      })
    }

    if (formData.newPassword.length < 6) {
      newErrors.push({
        field: 'newPassword',
        message: t("reset_password_page.errors.new_password_min")
      })
    }

    if (!formData.confirmPassword) {
      newErrors.push({
        field: 'confirmPassword',
        message: t("reset_password_page.errors.confirm_password_required")
      })
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push({
        field: 'confirmPassword',
        message: t("reset_password_page.errors.passwords_mismatch")
      })
    }

    return newErrors;
  }

  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    setErrors(prev => prev.filter(e => e.field !== field));
  };

  const handleSubmit = async () => {
    const validationErrors = validate();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    await changePassword.mutateAsync(formData.newPassword);
  }

  useEffect(() => {
    if (changePassword.isSuccess) {
      setFormData({ newPassword: '', confirmPassword: '' });
      navigate('/', { replace: true });
    }
  }, [changePassword.isSuccess, changePassword.isError, changePassword.mutateAsync]);

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

        <Card dir={lang === "ar" ? "rtl" : "ltr"}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t("reset_password_page.title")}
            </CardTitle>
            <CardDescription>
              {t("reset_password_page.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-start">
            <p className="text-sm text-muted-foreground text-center mb-3">
              {t("reset_password_page.helper_text")}
            </p>
            <div className='flex flex-col gap-2'>
              <div>
                <Label>{t("reset_password_page.new_password")}</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                />
                {getError('newPassword') && (
                  <p className="text-red-500 text-sm mt-1">
                    {getError('newPassword')}
                  </p>
                )}
              </div>
              <div>
                <Label>{t("reset_password_page.confirm_password")}</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                />
                {getError('confirmPassword') && (
                  <p className="text-red-500 text-sm mt-1">
                    {getError('confirmPassword')}
                  </p>
                )}
              </div>

              {getError('server') && (
                <p className="text-red-500 text-sm mt-1">
                  {getError('server')}
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? t("reset_password_page.hide_password") : t("reset_password_page.show_password")}
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              className='flex-1 mt-6'
              disabled={changePassword.isPending}
            >
              {t("reset_password_page.change_password")}
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword