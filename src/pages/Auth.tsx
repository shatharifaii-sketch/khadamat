
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Home } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';


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
    if (!email || !password) {
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
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          if (error.message.includes('Invalid login credentials')) {
            toast.error(t("invalid_credentials"));
          } else if (error.message.includes('Email not confirmed')) {
            toast.error(t("email_not_confirmed"));
          } else {
            toast.error(t("login_error") + error.message);
          }
        } else {
          toast.success(t("login_success"));
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      } else {
        const { data, error } = await signUp(email, password, fullName, passwordConfirm);
        if (!error) {
          toast.success(t("signup_success"));
          navigate('/confirm-email', { state: { email } });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(t("unexpected_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    signInWithGoogle();
  }
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

        <Card className='mb-2' dir={lang === "ar" ? "rtl" : "ltr"}>
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
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                >
                  {isLogin ? t("switch_to_signup") : t("switch_to_login")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default Auth;
