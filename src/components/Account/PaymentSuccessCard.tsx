import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccessCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
  
  const paymentSuccess = location.state?.paymentSuccess;
  const transactionId = location.state?.transactionId;

  useEffect(() => {
    if (paymentSuccess) {
      setShowCard(true);
      
      // Auto-hide after 10 seconds
      const hideTimer = setTimeout(() => {
        setShowCard(false);
        // Clear the state to prevent showing again on refresh
        navigate(location.pathname, { replace: true });
      }, 10000);
      
      return () => clearTimeout(hideTimer);
    }
  }, [paymentSuccess, navigate, location.pathname]);

  if (!showCard || !paymentSuccess) return null;

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 dark:border-green-800 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <CheckCircle className="w-5 h-5" />
          تم الدفع بنجاح!
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-green-700 dark:text-green-300">
          <p className="font-medium">مبروك! تم تفعيل اشتراكك بنجاح.</p>
          <p className="mt-1">يمكنك الآن نشر خدماتك والبدء في استقبال العملاء.</p>
          {transactionId && (
            <p className="text-xs text-muted-foreground mt-2">
              رقم المعاملة: {transactionId}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCard(false)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            حسناً
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              setShowCard(false);
              navigate('/post-service');
            }}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            انشر خدمة جديدة
            <ArrowRight className="w-3 h-3 mr-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSuccessCard;