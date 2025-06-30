
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle } from 'lucide-react';
import { Subscription } from '@/hooks/useSubscription';

interface PaymentOrderSummaryProps {
  subscription: Subscription | null;
  servicesNeeded: number;
  amount: number;
  serviceData?: any;
}

const PaymentOrderSummary = ({ 
  subscription, 
  servicesNeeded, 
  amount, 
  serviceData 
}: PaymentOrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ملخص الطلب</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Subscription Status */}
        {subscription && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">اشتراكك الحالي:</h4>
            <p className="text-blue-700">
              استخدمت {subscription.services_used} من {subscription.services_allowed} خدمات
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
          <CheckCircle className="text-primary" size={24} />
          <div>
            <h3 className="font-semibold text-lg">
              {servicesNeeded === 2 ? 'باقة جديدة' : 'خدمات إضافية'}
            </h3>
            <p className="text-muted-foreground">
              {servicesNeeded} خدمات جديدة
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>عدد الخدمات:</span>
            <span>{servicesNeeded}</span>
          </div>
          <div className="flex justify-between">
            <span>السعر لكل خدمة:</span>
            <span>5 شيكل</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>المجموع:</span>
            <span>{amount} شيكل</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">ما ستحصل عليه:</h4>
          <ul className="text-green-700 space-y-1">
            <li>• إمكانية نشر {servicesNeeded} خدمات جديدة</li>
            <li>• تواصل مباشر مع العملاء</li>
            <li>• إظهار متقدم في البحث</li>
            <li>• دعم فني</li>
          </ul>
        </div>

        {serviceData && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">الخدمة المراد نشرها:</h4>
            <p className="text-muted-foreground">{serviceData.title}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentOrderSummary;
