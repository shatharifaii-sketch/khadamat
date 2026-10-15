import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeftToLine, Home, Loader, Mail, Phone } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import PhoneVerification from "@/components/PhoneVerification";
import { SelectLabel } from "@radix-ui/react-select";
import { countries } from "@/types/constants";
import { FieldErrors } from "@/types/auth";

const hasErrors = (e: FieldErrors) => Object.values(e).some(Boolean);

function validateForm(v: {
  isLogin: boolean; usePhone: boolean; email: string; password: string; passwordConfirm: string; fullName: string; phone: { countryCode: string; number: string};
}): FieldErrors {
  const e: FieldErrors = {};

  if (v.usePhone) {
    if (!v.phone.countryCode || !v.phone.number) e.phoneError = "required_fields_error";
  } else if (!v.email) {
    e.emailError = "required_fields_error";
  }

  if ((!v.usePhone || !v.isLogin) && !v.password) e.passwordError = "required_fields_error";

  if (!v.isLogin) {
    if (!v.fullName.trim()) e.fullNameError = "full_name_error";
    if (v.password !== v.passwordConfirm) e.passwordConfirmError = "passwords_do_not_match"
  }

  return e;
}

const Auth = () => {
  const { t } = useTranslation("auth");
  const lang = localStorage.getItem("language") || "en";
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (...keys: (keyof FieldErrors)[]) =>
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });

  const { signIn, signUp, user, signInWithGoogle } = useAuth();

  const [usePhone, setUsePhone] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phone, setPhone] = useState({
    countryCode: "",
    number: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  if (user) {
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
    return null;
  }

  const handleAuthError = (error: FieldErrors) => {
    setErrors(error);

    switch(error.formError) {
      case undefined:
        if (!hasErrors(error)) toast.error(t("unknown_error"));
        break;
      case "user_not_found":
        toast.warning(t("user_not_found"), {
          icon: <ArrowLeftToLine size={16} />,
          action: {
            label: t("signup_action"), onClick: () => setIsLogin(false)
          }
        });
        break;
      case "user_exists":
        toast.warning(t("user_exists"), {
          icon: <ArrowLeftToLine size={16} />,
          action: {
            label: t("login_action"), onClick: () => setIsLogin(true)
          }
        });
        break;
      default:
        toast.error(t(error.formError))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientErrors = validateForm({
      isLogin, usePhone, email, password, passwordConfirm, fullName, phone
    });

    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const method = usePhone ? "phone" : "email";

      const result = isLogin 
        ? await signIn(usePhone ? null : email, password, usePhone ? phone : null, method)
        : await signUp(usePhone ? null : email, password, fullName, passwordConfirm, usePhone ? phone : null, method);
      
      if (result.error) {
        handleAuthError(result.error);
        return;
      }

      if (usePhone) {
        if (!isLogin) toast.success(t("phone_signup_success"));
        setVerifyingPhone(true);
      } else if (isLogin) {
        toast.success(t("login_success"));
        navigate(location.state?.from?.pathname || "/", { replace: true });
      } else {
        toast.success(t("signup_success"));
        navigate("/confirm-email", { state: { email } });
      }
    } catch (error: unknown) {
      console.error(
        "Auth error:",
        error instanceof Error ? error.message : error,
      );
      toast.error(t("unexpected_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    signInWithGoogle();
  };

  const handlePhone = ({
    number: phone,
    countryCode: code,
  }: {
    number: string;
    countryCode: string;
  }) => {
    setPhone({
      number: phone,
      countryCode: code,
    });
  };

  const hanldePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");

    handlePhone({
      ...phone,
      number: digits,
    });
  };

  const handleCountryChange = (code: string) => {
    handlePhone({
      ...phone,
      countryCode: code,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md" dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="text-center mb-8 arabic">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 space-x-reverse mb-6"
          >
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home size={24} />
            </div>
            <img
              src="/application_logo_cut.png"
              className="h-10"
              alt="cut logo"
            />
          </Link>
        </div>
        <Card
          className="mb-2 relative z-10"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? t("login_title") : t("signup_title")}
            </CardTitle>
            <CardDescription>
              {isLogin ? t("login_description") : t("signup_description")}
            </CardDescription>
          </CardHeader>
          <div className="flex flex-col justify-center items-center mb-2">
            <div className="flex justify-between items-center p-1 gap-2 border rounded-full w-fit mx-auto bg-muted/70 overflow-hidden">
              <div
                onClick={() => {
                  setUsePhone(true);
                  // toast(t("phone_login_disabled"), {
                  //   description: t("phone_login_description"),
                  // });
                }}
                className={cn(
                  "p-2 rounded-full flex items-center justify-center w-1/2 hover:cursor-pointer transition-all",
                  usePhone ? "bg-white text-primary shadow-md" : "",
                )}
              >
                <Phone />
              </div>
              <div
                onClick={() => setUsePhone(false)}
                className={cn(
                  "p-2 rounded-full flex items-center justify-center w-1/2 hover:cursor-pointer transition-all",
                  !usePhone ? "bg-white text-primary shadow-md" : "",
                )}
              >
                <Mail />
              </div>
            </div>
          </div>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("full_name")}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t("full_name_placeholder")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                  
                  {errors.fullNameError && (
                      <p id="email-error">{t(errors.fullNameError)}</p>
                    )}
                </div>
              )}

              <div className="space-y-2">
                {usePhone ? (
                  <>
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <div className="flex items-center gap-1 md:gap-4">
                      <Select
                        value={phone.countryCode}
                        onValueChange={(e) => handleCountryChange(e)}
                        dir="rtl"
                      >
                        <SelectTrigger className="w-32.5">
                          <SelectValue placeholder={t("code")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{t("code")}</SelectLabel>
                            {countries.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                <div className="flex items-center gap-2">
                                  {c.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      <Input
                        type="tel"
                        value={phone.number}
                        onChange={(e) => hanldePhoneChange(e.target.value)}
                        placeholder="599123456"
                        dir={lang === "ar" ? "rtl" : "ltr"}
                      />
                    </div>

                    {errors.phoneError && (
                      <p id="email-error">{t(errors.phoneError)}</p>
                    )}
                  </>
                ) : (
                  <>
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("email_placeholder")}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("emailError", "formError");
                      }}
                      aria-invalid={!!errors.emailError}
                      aria-describedby={
                        errors.emailError ? "email-error" : undefined
                      }
                      required
                    />
                    {errors.emailError && (
                      <p id="email-error">{t(errors.emailError)}</p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {errors.passwordError && (
                      <p id="email-error">{t(errors.passwordError)}</p>
                    )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="password">{t("confirm_password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("password_placeholder")}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                  />
                  {errors.passwordConfirmError && (
                      <p id="email-error">{t(errors.passwordConfirmError)}</p>
                    )}
                </div>
              )}
              {isLogin && !usePhone && (
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline text-end"
                >
                  {t("forgot_password")}
                </Link>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? t("processing")
                  : isLogin
                    ? t("login_button")
                    : t("signup_button")}
              </Button>
            </form>

            <GoogleSignInButton singInFn={handleGoogleSignIn} />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? t("no_account") : t("have_account")}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline mr-2"
                  disabled={loading}
                >
                  {isLogin ? t("switch_to_signup") : t("switch_to_login")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <LanguageSwitcher />
      </div>

      <Dialog open={verifyingPhone}>
        <PhoneVerification phone={phone} password={password} />
      </Dialog>
    </div>
  );
};

export default Auth;
