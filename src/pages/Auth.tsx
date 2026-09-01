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

const Auth = () => {
  const { t } = useTranslation("auth");
  const lang = localStorage.getItem("language") || "en";
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usePhone && (!email || !password)) {
      toast.error(t("required_fields_error"));
      return;
    }

    // if (usePhone && (!phone.countryCode || !phone.number)) {
    //   toast.error(t("required_fields_error"));
    //   return;
    // }

    if (!isLogin && !fullName) {
      toast.error(t("full_name_error"));
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(
          email, // usePhone ? null : email,
          password,
          null, // usePhone ? phone : null,
          "email" // usePhone ? "phone" : "email",
        );

        if (error) {
          console.error("Sign in error:", error);

          if (error instanceof Error) {
            if (error.message.includes("Invalid login credentials")) {
              toast.error(t("invalid_credentials"));
            } else if (error.message.includes("Email not confirmed")) {
              toast.error(t("email_not_confirmed"));
            }
          } else {
            if (typeof error == "string" && error == "user_not_found") {
              toast.warning(
                lang == "ar" ? "ما لقينا المستخدم!" : "User not found!",
                {
                  icon: (
                    <>
                      <ArrowLeftToLine size={16} />
                    </>
                  ),
                  action: {
                    label: lang == "ar" ? "إنشاء حساب!" : "Signup!",
                    onClick: () => {
                      setIsLogin(false);
                    },
                  },
                },
              );
            }

            if (typeof error == "string" && error == "Too many requests. Please wait a minute before trying again.") {
              toast.error(t("too_many_requests"));
            }
          }

          return;
        } else {
          if (usePhone) {
            setLoading(false);
            setVerifyingPhone(true);
          } else {
            toast.success(t("login_success"));
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
          }
        }
      } else {
        const { data, error } = await signUp(
          email, // usePhone ? null : email,
          password,
          fullName,
          passwordConfirm,
          null, // usePhone ? phone : null,
          "email" // usePhone ? "phone" : "email",
        );
        if (!error) {
          if (!usePhone) {
            toast.success(t("signup_success"));
            setLoading(false);
            navigate("/confirm-email", { state: { email } });
          } else {
            toast.success(t("phone_signup_success"));
            setLoading(false);
            setVerifyingPhone(true);
          }
        } else if (error == "user_exists") {
          toast.warning(
            lang == "ar" ? "المستخدم مسجل من قبل!" : "User already exsts!",
            {
              icon: (
                <>
                  <ArrowLeftToLine size={16} />
                </>
              ),
              action: {
                label: lang == "ar" ? "تسجيل الدخول!" : "Login!",
                onClick: () => {
                  setIsLogin(true);
                },
              },
            },
          );
        } else if (error == "Too many requests. Please wait a minute before trying again.") {
          toast.error(t("too_many_requests"));
        }
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
                  // setUsePhone(true)
                  toast(t("phone_login_disabled"), {
                    description: t("phone_login_description"),
                  });
                }}
                className={cn(
                  "p-2 rounded-full flex items-center justify-center w-1/2 hover:cursor-pointer transition-all opacity-35",
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
                        <SelectTrigger className="w-[130px]">
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
                  </>
                ) : (
                  <>
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("email_placeholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </>
                )}
              </div>

              {!usePhone && (
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
                </div>
              )}
              {!isLogin && !usePhone && (
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
