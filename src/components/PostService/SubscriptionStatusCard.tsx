
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
              حالة اشتراكك: {subscription.services_used}/{subscription.services_allowed} خدمات مستخدمة
            </span>
          </div>
          {subscription.services_used >= subscription.services_allowed && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-600" size={20} />
                <span className="font-semibold text-red-800">استنفدت حصتك من الخدمات</span>
              </div>
              <p className="text-red-700">
                تحتاج لدفع 10 شيكل إضافية لنشر خدمتين جديدتين
              </p>
              <Button 
                onClick={() => navigate('/payment', { state: { servicesNeeded: 2 } })}
                className="mt-3"
                variant="destructive"
              >
                ادفع الآن لنشر المزيد
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
          <span className="text-xl font-semibold text-primary">ادفع لتنشر خدماتك</span>
        </div>
        <p className="text-muted-foreground text-large mb-4">
          10 شيكل لخدمتين شهرياً - نشر فوري بدون انتظار موافقة
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <span className="font-semibold text-yellow-800">نظام الدفع</span>
          </div>
          <p className="text-yellow-700">
            10 شيكل لكل خدمتين. تريد المزيد؟ ادفع 10 شيكل إضافية لخدمتين أخريين.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
