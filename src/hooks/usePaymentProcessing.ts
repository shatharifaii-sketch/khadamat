
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useCouponLogic } from '@/hooks/useCouponLogic';
import { AppliedCoupon } from '@/components/Payment/CouponInput';
import { PaymentFormData } from '@/hooks/usePaymentState';

export const usePaymentProcessing = () => {
  const navigate = useNavigate();
  const { createPaymentTransaction, completePayment } = useSubscription();
  const { recordCouponUsage, handleFreeSubscription } = useCouponLogic();

  const processPayment = async (
    paymentMethod: string,
    paymentData: PaymentFormData,
    appliedCoupon: AppliedCoupon | null,
    finalAmount: number,
    servicesNeeded: number
  ) => {
    // Handle free subscription for FIRSTFREE coupon
    if (appliedCoupon?.type === 'first_month_free') {
      const success = await handleFreeSubscription(appliedCoupon, servicesNeeded);
      if (success) {
        navigate('/account');
      }
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
        await recordCouponUsage(appliedCoupon.id, transaction.id, appliedCoupon);
      }

      // Process payment based on method
      await handlePaymentMethod(paymentMethod, paymentData, transaction, finalAmount);
      
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handlePaymentMethod = async (
    paymentMethod: string,
    paymentData: PaymentFormData,
    transaction: any,
    finalAmount: number
  ) => {
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
  };

  return {
    processPayment,
    isCreatingTransaction: createPaymentTransaction.isPending
  };
};
