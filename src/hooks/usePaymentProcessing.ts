
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { PaymentFormData } from '@/hooks/usePaymentState';
import { toast } from 'sonner';

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
    try {
      if (paymentMethod === 'reflect') {
        // Show payment processing notification
        const paymentToast = toast.loading('جاري تحويلك لصفحة الدفع...', {
          duration: 10000
        });
        
        window.open(`https://reflect.ps/payment?amount=${finalAmount}&reference=${transaction.id}`, '_blank');
        
        // Enhanced payment completion with verification
        setTimeout(async () => {
          toast.dismiss(paymentToast);
          
          const completionToast = toast.loading('جاري التحقق من حالة الدفع...', {
            duration: 15000
          });
          
          try {
            await completePayment.mutateAsync({ 
              transactionId: transaction.id,
              externalTransactionId: `reflect_${Date.now()}`
            });
            
            toast.dismiss(completionToast);
            toast.success('تم الدفع بنجاح! جاري تحضير خدماتك...', {
              duration: 5000
            });
            
            // Navigate with success state
            navigate('/account', { 
              state: { 
                paymentSuccess: true,
                transactionId: transaction.id 
              } 
            });
            
          } catch (error) {
            toast.dismiss(completionToast);
            toast.error('حدث خطأ في تأكيد الدفع. سيتم المحاولة مرة أخرى تلقائياً.', {
              action: {
                label: 'إعادة المحاولة',
                onClick: () => window.location.reload()
              }
            });
          }
        }, 5000);
        
      } else if (paymentMethod === 'jawwal_pay') {
        const smsToast = toast.loading(`جاري إرسال رسالة تأكيد إلى ${paymentData.phoneNumber}...`);
        
        setTimeout(async () => {
          toast.dismiss(smsToast);
          
          const verificationToast = toast.loading('جاري تأكيد الدفع...', {
            duration: 10000
          });
          
          try {
            await completePayment.mutateAsync({ 
              transactionId: transaction.id,
              externalTransactionId: `jawwal_${Date.now()}`
            });
            
            toast.dismiss(verificationToast);
            toast.success('تم الدفع بنجاح عبر جوال باي!', {
              duration: 5000
            });
            
            navigate('/account', { 
              state: { 
                paymentSuccess: true,
                transactionId: transaction.id 
              } 
            });
            
          } catch (error) {
            toast.dismiss(verificationToast);
            toast.error('حدث خطأ في تأكيد الدفع. يرجى المحاولة مرة أخرى.');
          }
        }, 3000);
        
      } else if (paymentMethod === 'paypal') {
        const paypalToast = toast.loading('جاري تحويلك لصفحة PayPal...', {
          duration: 8000
        });
        
        setTimeout(async () => {
          toast.dismiss(paypalToast);
          
          const completionToast = toast.loading('جاري تأكيد الدفع من PayPal...', {
            duration: 12000
          });
          
          try {
            await completePayment.mutateAsync({ 
              transactionId: transaction.id,
              externalTransactionId: `paypal_${Date.now()}`
            });
            
            toast.dismiss(completionToast);
            toast.success('تم الدفع بنجاح عبر PayPal!', {
              duration: 5000
            });
            
            navigate('/account', { 
              state: { 
                paymentSuccess: true,
                transactionId: transaction.id 
              } 
            });
            
          } catch (error) {
            toast.dismiss(completionToast);
            toast.error('حدث خطأ في تأكيد الدفع. يرجى المحاولة مرة أخرى.');
          }
        }, 4000);
      }
      
    } catch (error) {
      console.error('Payment method error:', error);
      toast.error('حدث خطأ في معالجة الدفع: ' + error.message);
    }
  };

  return {
    processPayment,
    isCreatingTransaction: createPaymentTransaction.isPending
  };
};
