import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Home } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';

const CodeVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const state = location.state as { email: string };

  useEffect(() => {
    if (code.length > 6) {
      setError('الكود لا يتجاوز 6 أرقام');
    }
  }, [code]);

  if (!state || !state.email) {
    navigate('/', { replace: true });
    return null;
  }

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
            <CardTitle>تأكيد الحساب</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              أدخل كود التحقق المرسل لك على بريدك الالكتروني
            </CardDescription>
            <Input
              type='text'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='mt-4'
            />
            <p className="text-red-500 text-sm mt-1 mr-1">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleVerify} className='flex-1'>
              تأكيد
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default CodeVerification