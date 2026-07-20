import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Home, Loader } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import PhoneVerification from '@/components/PhoneVerification';

const countries = [
  { code: "970", label: "PS +970" },
  { code: "972", label: "IS +972" },
  { code: "966", label: "SA +966" },
  { code: "20", label: "EG +20" },
  { code: "971", label: "AE +971" },
  { code: "963", label: "SY +963" },
  { code: "962", label: "JO +962" },
  { code: "31", label: "NL +31" },
  { code: "1", label: "US +1" },
];

const Auth = () => {
  const { t } = useTranslation("auth");
  const lang = localStorage.getItem("language") || "en";
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user, signInWithGoogle } = useAuth();

  const [usePhone, setUsePhone] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phone, setPhone] = useState({
    countryCode: '',
    number: '',
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  if (user) {
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usePhone && (!email || !password)) {
      toast.error(t("required_fields_error"));
      return;
    }

    if (usePhone && (!phone.countryCode || !phone.number || !password)) {
      toast.error(t("required_fields_error"));
      return;
    }

    if (!isLogin && !fullName) {
      toast.error(t("full_name_error"));
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(
          usePhone ? null : email,
          password,
          usePhone ? phone : null,
          usePhone ? "phone" : "email"
        );

        if (error) {
          console.error('Sign in error:', error);

          if (error instanceof Error) {
            if (error.message.includes('Invalid login credentials')) {
              toast.error(t("invalid_credentials"));
            } else if (error.message.includes('Email not confirmed')) {
              toast.error(t("email_not_confirmed"));
            }
          } else {
            toast.error(t("login_error") + error);
          }

        }
        else {
          toast.success(t("login_success"));
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });

        }
      } else {
        const { data, error } = await signUp(
          usePhone ? null : email,
          password,
          fullName,
          passwordConfirm,
          usePhone ? phone : null,
          usePhone ? "phone" : "email"
        );
        if (!error) {
          if (!usePhone) {
            toast.success(t("signup_success"));
            setLoading(false);
            navigate('/confirm-email', { state: { email } });
          } else {
            toast.success(t("phone_signup_success"));
            setLoading(false);
            setVerifyingPhone(true);
          }
        }
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      toast.error(t("unexpected_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    signInWithGoogle();
  }

  const handlePhone = ({ number: phone, countryCode: code }: { number: string, countryCode: string }) => {
    setPhone({
      number: phone,
      countryCode: code
    });
  }

  const hanldePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");

    handlePhone({
      ...phone,
      number: digits
    })
  }

  const handleCountryChange = (code: string) => {
    handlePhone({
      ...phone,
      countryCode: code,
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 arabic">
          <Link to="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home size={24} />
            </div>
            <img src="/application_logo_cut.png" className='h-10' alt="cut logo" />
          </Link>
        </div>
        <Card className='mb-2 relative z-10' dir={lang === "ar" ? "rtl" : "ltr"}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? t("login_title") : t("signup_title")}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? t("login_description")
                : t("signup_description")
              }
            </CardDescription>
          </CardHeader>
          <div className="flex justify-between items-center p-1 border rounded-md w-2/3 mx-auto bg-muted/70 overflow-hidden mb-2">
            <div
              onClick={() => setUsePhone(prev => !prev)}
              className={cn("py-1 rounded-sm flex items-center justify-center w-1/2 hover:cursor-pointer transition-all", usePhone ? "bg-white text-primary shadow-md" : "")}
            >
              <p>use phone</p>
            </div>
            <div
              onClick={() => setUsePhone(prev => !prev)}
              className={cn("py-1 rounded-sm flex items-center justify-center w-1/2 hover:cursor-pointer transition-all", !usePhone ? "bg-white text-primary shadow-md" : "")}
            >
              <p>use email</p>
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
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {countries.map((c) => (
                              <SelectItem
                                key={c.code} value={c.code}
                              >
                                <div className="flex items-center gap-2">
                                  {c.label}
                                </div>
                              </SelectItem>
                            )
                            )}
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
                </div>
              )}
              {isLogin && (
                <Link to="/forgot-password" className="text-sm text-primary hover:underline text-end">
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
                    : t("signup_button")
                }
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

      <Dialog
        open={verifyingPhone}
      >
        <PhoneVerification phone={phone} password={password} />
      </Dialog>
    </div>
  );
};

export default Auth;
