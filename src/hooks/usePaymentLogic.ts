
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppliedCoupon } from '@/components/Payment/CouponInput';

export const usePaymentLogic = () => {
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

  return {
    serviceData,
    servicesNeeded,
    baseAmount,
    finalAmount,
    paymentMethod,
    setPaymentMethod,
    appliedCoupon,
    setAppliedCoupon,
    paymentData,
    handleInputChange,
    handlePayment,
    subscription,
    isCreatingTransaction: createPaymentTransaction.isPending,
    navigate
  };
};
