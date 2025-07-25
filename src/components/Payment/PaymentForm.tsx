
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentMethodForms from './PaymentMethodForms';
import CouponInput from './CouponInput';

interface PaymentFormProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  paymentData: any;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  finalAmount: number;
  isCreatingTransaction: boolean;
  onBack: () => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: any;
  isValidating: boolean;
  validateCoupon: (code: string, userId: string) => Promise<void>;
  removeCoupon: () => void;
}

const PaymentForm = ({
  paymentMethod,
  onPaymentMethodChange,
  paymentData,
  onInputChange,
  onSubmit,
  finalAmount,
  isCreatingTransaction,
  onBack,
  couponCode,
  setCouponCode,
  appliedCoupon,
  isValidating,
  validateCoupon,
  removeCoupon
}: PaymentFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">طريقة الدفع</CardTitle>
        <CardDescription>
          اختر طريقة الدفع المناسبة لك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Coupon Input */}
          <CouponInput
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            appliedCoupon={appliedCoupon}
            isValidating={isValidating}
            validateCoupon={validateCoupon}
            removeCoupon={removeCoupon}
          />
          
          <Separator />
          
          {/* Payment Method Selection */}
          <PaymentMethodSelector 
            selectedMethod={paymentMethod}
            onMethodChange={onPaymentMethodChange}
          />

          <Separator />

          {/* Payment Method Specific Forms */}
          <PaymentMethodForms 
            paymentMethod={paymentMethod}
            paymentData={paymentData}
            onInputChange={onInputChange}
          />

          <div className="space-y-4 pt-4">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-xl py-6"
              disabled={isCreatingTransaction}
            >
              <ArrowRight className="ml-2" size={20} />
              {isCreatingTransaction 
                ? 'جاري المعالجة...' 
                : `ادفع ${finalAmount} شيكل`
              }
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              className="w-full text-xl py-6"
              onClick={onBack}
            >
              <ArrowLeft className="ml-2" size={20} />
              العودة
            </Button>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-gray-600" size={16} />
              <span className="font-semibold text-gray-800">ملاحظة مهمة</span>
            </div>
            <p className="text-gray-700 text-sm">
              بعد إتمام الدفع بنجاح، ستتمكن من نشر خدماتك فوراً دون الحاجة لانتظار الموافقة.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
