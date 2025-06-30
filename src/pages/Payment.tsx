
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import PaymentOrderSummary from '@/components/Payment/PaymentOrderSummary';
import PaymentMethodSelector from '@/components/Payment/PaymentMethodSelector';
import PaymentMethodForms from '@/components/Payment/PaymentMethodForms';
import CouponInput, { AppliedCoupon } from '@/components/Payment/CouponInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createPaymentTransaction, completePayment, getUserSubscription } = useSubscription();
  
  const serviceData = location.state?.serviceData;
  const servicesNeeded = location.state?.servicesNeeded || 2;
  const baseAmount = servicesNeeded * 5; // 5 NIS per service

  const [paymentMethod, setPaymentMethod] = useState('reflect');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    phoneNumber: '',
    accountNumber: ''
  });

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  const subscription = getUserSubscription.data;

  // Calculate final amount after coupon
  const finalAmount = appliedCoupon 
    ? Math.max(0, baseAmount - appliedCoupon.discount_amount)
    : baseAmount;

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const recordCouponUsage = async (couponId: string, transactionId?: string) => {
    if (!appliedCoupon) return;

    try {
      await supabase
        .from('coupon_usage')
        .insert({
          user_id: user.id,
          coupon_id: couponId,
          transaction_id: transactionId,
          discount_applied: appliedCoupon.discount_amount
        });

      // Get current coupon data and increment used count
      const { data: couponData, error: fetchError } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', couponId)
        .single();

      if (fetchError) {
        console.error('Error fetching coupon:', fetchError);
        return;
      }

      // Update coupon used count
      await supabase
        .from('coupons')
        .update({ used_count: (couponData.used_count || 0) + 1 })
        .eq('id', couponId);
    } catch (error) {
      console.error('Error recording coupon usage:', error);
    }
  };

  const handleFreeSubscription = async () => {
    if (!appliedCoupon || appliedCoupon.type !== 'first_month_free') return;

    try {
      // Create subscription directly without payment
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          services_allowed: servicesNeeded,
          services_used: 0,
          amount: 0,
          payment_method: 'coupon',
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      await recordCouponUsage(appliedCoupon.id);
      toast.success('تم تفعيل اشتراكك المجاني! يمكنك الآن نشر خدماتك.');
      navigate('/account');
    } catch (error) {
      console.error('Error creating free subscription:', error);
      toast.error('حدث خطأ في تفعيل الاشتراك المجاني');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle free subscription for FIRSTFREE coupon
    if (appliedCoupon?.type === 'first_month_free') {
      await handleFreeSubscription();
      return;
    }
    
    try {
      // Determine services quota based on coupon
      let servicesQuota = servicesNeeded;
      let subscriptionMonths = 1;
      
      if (appliedCoupon?.type === 'three_months_for_one') {
        subscriptionMonths = 3;
      }

      // Create payment transaction
      const transaction = await createPaymentTransaction.mutateAsync({
        amount: finalAmount,
        currency: 'ILS',
        payment_method: paymentMethod,
        services_quota: servicesQuota,
        status: 'pending',
        payment_data: {
          ...paymentData,
          coupon_code: appliedCoupon?.code,
          subscription_months: subscriptionMonths
        }
      });

      // Record coupon usage
      if (appliedCoupon) {
        await recordCouponUsage(appliedCoupon.id, transaction.id);
      }

      // Simulate payment processing based on method
      if (paymentMethod === 'reflect') {
        window.open(`https://reflect.ps/payment?amount=${finalAmount}&reference=${transaction.id}`, '_blank');
        
        setTimeout(async () => {
          await completePayment.mutateAsync({ 
            transactionId: transaction.id,
            externalTransactionId: `reflect_${Date.now()}`
          });
          navigate('/account');
        }, 5000);
        
      } else if (paymentMethod === 'jawwal_pay') {
        alert(`سيتم إرسال رسالة نصية إلى ${paymentData.phoneNumber} لتأكيد الدفع`);
        
        setTimeout(async () => {
          await completePayment.mutateAsync({ 
            transactionId: transaction.id,
            externalTransactionId: `jawwal_${Date.now()}`
          });
          navigate('/account');
        }, 3000);
        
      } else if (paymentMethod === 'credit_card') {
        alert('سيتم معالجة الدفع عبر البطاقة الائتمانية...');
        
        setTimeout(async () => {
          await completePayment.mutateAsync({ 
            transactionId: transaction.id,
            externalTransactionId: `card_${Date.now()}`
          });
          navigate('/account');
        }, 4000);
        
      } else if (paymentMethod === 'bank_transfer') {
        alert('سيتم توجيهك لتفاصيل التحويل البنكي');
        navigate('/bank-transfer', { state: { transaction } });
      }
      
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            إتمام الدفع
          </h1>
          <p className="text-xl text-muted-foreground">
            ادفع لتتمكن من نشر خدماتك
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <PaymentOrderSummary 
            subscription={subscription}
            servicesNeeded={servicesNeeded}
            amount={baseAmount}
            serviceData={serviceData}
            appliedCoupon={appliedCoupon}
            finalAmount={finalAmount}
          />

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">طريقة الدفع</CardTitle>
              <CardDescription>
                {appliedCoupon?.type === 'first_month_free' 
                  ? 'اشتراكك مجاني! اضغط على زر التفعيل أدناه'
                  : 'اختر طريقة الدفع المناسبة لك'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Coupon Input */}
                <CouponInput 
                  onCouponApplied={setAppliedCoupon}
                  appliedCoupon={appliedCoupon}
                />

                <Separator />

                {/* Show payment method selection only if not free */}
                {appliedCoupon?.type !== 'first_month_free' && (
                  <>
                    {/* Payment Method Selection */}
                    <PaymentMethodSelector 
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={setPaymentMethod}
                    />

                    <Separator />

                    {/* Payment Method Specific Forms */}
                    <PaymentMethodForms 
                      paymentMethod={paymentMethod}
                      paymentData={paymentData}
                      onInputChange={handleInputChange}
                    />
                  </>
                )}

                <div className="space-y-4 pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-xl py-6"
                    disabled={createPaymentTransaction.isPending}
                  >
                    <ArrowRight className="ml-2" size={20} />
                    {createPaymentTransaction.isPending 
                      ? 'جاري المعالجة...' 
                      : appliedCoupon?.type === 'first_month_free'
                        ? 'تفعيل الاشتراك المجاني'
                        : `ادفع ${finalAmount} شيكل`
                    }
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="w-full text-xl py-6"
                    onClick={() => navigate('/post-service', { state: { serviceData } })}
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
        </div>
      </div>
    </div>
  );
};

export default Payment;
