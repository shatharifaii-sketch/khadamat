import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Home } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const CodeVerification = () => {
  const { t } = useTranslation("auth");
  const lang = localStorage.getItem("language") || "en";

  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const state = location.state as { email: string };

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
    try {
      const { error } = await verifyOtp(state.email, code);

      if (error) {
        setError(error.message);
        return;
      }

      navigate('/', { replace: true });
    } catch (error: any) {
      setError(error.message);
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
            <img src="/application_logo_cut.png" className='h-12' alt="cut logo" />
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
              type='text'
              value={code}
              placeholder={t("code_verification.input_placeholder")}
              onChange={(e) => setCode(e.target.value)}
              className='mt-4'
            />
            <p className="text-red-500 text-sm mt-1 mr-1">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleVerify} className='flex-1'>
              {t("code_verification.button")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default CodeVerification