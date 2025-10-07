import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, CreditCard, Star } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { usePaymentLogic } from '@/hooks/usePaymentLogic';

interface PaymentOrderSummaryProps {
  subscription: any;
  servicesNeeded: number;
  amount: number;
  serviceData: any;
  finalAmount: number;
  subscriptionTier: string;
  discount?: number;
  subscriptionToGet?: Tables<'subscription_tiers'>
}

const PaymentOrderSummary = (props: PaymentOrderSummaryProps) => {
  const {
    subscription,
    servicesNeeded,
    amount,
    serviceData,
    finalAmount,
    subscriptionTier,
    discount = 0,
    subscriptionToGet
  } = props;

  console.log('PaymentOrderSummary props:', props);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ملخص الطلب</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Subscription Status */}
        {subscription && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-blue-600" size={20} />
              <span className="font-medium text-blue-900">اشتراكك الحالي</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>الخدمات المتاحة: {subscription.services_allowed}</p>
              <p>الخدمات المستخدمة: {subscription.services_used}</p>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>ينتهي في: {new Date(subscription.expires_at).toLocaleDateString('ar')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Service Info */}
        {serviceData > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">تفاصيل الخدمة</h4>
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium">{serviceData.title}</p>
              <p className="text-gray-600">{serviceData.category}</p>
            </div>
          </div>
        )}

        {/* Package Details */}
        <div className="space-y-2">
          <h4 className="font-medium">تفاصيل الباقة</h4>
          <div className="flex items-center justify-between">
            <span>نوع الاشتراك</span>
            <Badge variant="secondary">
              {subscriptionTier === 'Yearly' ? 'سنوي' : 'شهري'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>عدد الخدمات</span>
            <Badge variant="outline">{servicesNeeded} {servicesNeeded > 2 ? 'خدمات' : 'خدمة'} شهريا</Badge>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1'><Star className='text-yellow-400' />المدة المجانية</span>
              <Badge variant="default" className='hover:bg-priamry'>{subscriptionToGet.free_trial_period_text}</Badge>
            </div>
            <p className='text-xs text-muted-foreground'>سيتم بدء الاشتراك بعد انتهاء المدة المجانية</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span>المجموع الفرعي</span>
            <span>{amount} شيكل</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-green-600">
              <span>خصم الكوبون</span>
              <span>-{discount} شيكل</span>
            </div>
          )}

          <div className="flex items-center justify-between font-bold text-lg border-t pt-2">
            <span>المجموع النهائي</span>
            <div className="flex items-center gap-1">
              <CreditCard size={16} />
              <span>{finalAmount} شيكل</span>
            </div>
          </div>
        </div>

        {/* Payment Note */}
        <div className="text-xs text-gray-500 text-center">
          {subscriptionTier === 'Yearly'
            ? 'سيتم رفع خدمتك تلقائياً كل شهر لمدة سنة كاملة'
            : 'سيتم تجديد اشتراكك تلقائياً كل شهر'}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentOrderSummary;
