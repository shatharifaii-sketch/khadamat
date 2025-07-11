
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Subscription } from '@/hooks/useSubscription';

interface SubscriptionStatusCardProps {
  subscription: Subscription | null;
}

const SubscriptionStatusCard = ({ subscription }: SubscriptionStatusCardProps) => {
  const navigate = useNavigate();

  if (subscription) {
    return (
      <Card className="bg-blue-50 border-blue-200 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CreditCard className="text-blue-600" size={24} />
            <span className="text-xl font-semibold text-blue-800">
              اشتراكك: {subscription.subscription_tier === 'yearly' ? 'سنوي' : 'شهري'} - 
              {subscription.services_used}/{subscription.services_allowed} خدمات مستخدمة
            </span>
          </div>
          {subscription.services_used >= subscription.services_allowed && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-600" size={20} />
                <span className="font-semibold text-red-800">استنفدت حصتك من الخدمات</span>
              </div>
              <p className="text-red-700">
                تحتاج لتجديد اشتراكك أو شراء اشتراك إضافي
              </p>
              <Button 
                onClick={() => navigate('/subscription-plans')}
                className="mt-3"
                variant="destructive"
              >
                تجديد الاشتراك
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 border-primary/20 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CreditCard className="text-primary" size={24} />
          <span className="text-xl font-semibold text-primary">اختر خطة الاشتراك</span>
        </div>
        <p className="text-muted-foreground text-large mb-4">
          اختر بين الاشتراك الشهري (10 شيكل) أو السنوي (100 شيكل) ووفر 20 شيكل
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-blue-800 mb-2">الاشتراك الشهري</h4>
            <p className="text-blue-700 text-2xl font-bold">10 شيكل</p>
            <p className="text-blue-600 text-sm">خدمة واحدة شهرياً</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs">
              وفر 20 شيكل
            </div>
            <h4 className="font-semibold text-green-800 mb-2">الاشتراك السنوي</h4>
            <p className="text-green-700 text-2xl font-bold">100 شيكل</p>
            <p className="text-green-600 text-sm">12 شهر + رفع تلقائي</p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/subscription-plans')}
          className="w-full"
          size="lg"
        >
          اختر خطة الاشتراك
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
