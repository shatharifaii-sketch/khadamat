
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { PaymentFormData } from '@/hooks/usePaymentState';

export const usePaymentProcessing = () => {
  const navigate = useNavigate();
  const { createPaymentTransaction, completePayment } = useSubscription();

  const processPayment = async (
    paymentMethod: string,
    paymentData: PaymentFormData,
    finalAmount: number,
    servicesNeeded: number,
    subscriptionTier: string = 'monthly'
  ) => {    
    try {
      // Determine services quota based on subscription tier
      let servicesQuota = subscriptionTier === 'yearly' ? 12 : 1;
      let subscriptionMonths = subscriptionTier === 'yearly' ? 12 : 1;

      // Create payment transaction
      const transaction = await createPaymentTransaction.mutateAsync({
        amount: finalAmount,
        currency: 'ILS',
        payment_method: paymentMethod,
        services_quota: servicesQuota,
        status: 'pending',
        subscription_tier: subscriptionTier,
        discount_applied: 0,
        original_amount: subscriptionTier === 'yearly' ? 100 : 10,
        payment_data: {
          ...paymentData,
          subscription_months: subscriptionMonths
        }
      });

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
      
    } else if (paymentMethod === 'paypal') {
      alert('سيتم معالجة الدفع عبر PayPal...');
      
      setTimeout(async () => {
        await completePayment.mutateAsync({ 
          transactionId: transaction.id,
          externalTransactionId: `paypal_${Date.now()}`
        });
        navigate('/account');
      }, 4000);
      
    }
  };

  return {
    processPayment,
    isCreatingTransaction: createPaymentTransaction.isPending
  };
};
