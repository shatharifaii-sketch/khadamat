import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaymentState } from '@/hooks/usePaymentState';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';
import { toast } from 'sonner';

export const useEnhancedPaymentLogic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getUserSubscription } = useSubscription();
  const paymentState = usePaymentState();
  const { processPayment, isCreatingTransaction } = usePaymentProcessing();
  
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { subscriptionToGet, serviceData } = location.state || {};
  
  const subscriptionTier = subscriptionToGet.price_monthly_title || 'Monthly';
  const servicesNeeded = subscriptionToGet.allowed_services || 2;
  const baseAmount = subscriptionTier === 'Yearly' ? subscriptionToGet.price_yearly_value : subscriptionToGet.price_monthly_value;

  console.log('Enhanced payment logic initialized...', subscriptionTier, servicesNeeded, baseAmount, serviceData, subscriptionToGet);

  // Enhanced authentication check with error handling
  useEffect(() => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للوصول إلى صفحة الدفع');
      navigate('/auth', { replace: true });
      return;
    }

    // Validate required payment state
    if (!serviceData && !location.state?.directPayment) {
      toast.error('بيانات الخدمة مفقودة');
      navigate('/post-service', { replace: true });
      return;
    }
  }, [user, serviceData, navigate, location.state]);

  // Redirect to auth if not logged in
  if (!user) {
    return null;
  }

  const subscription = getUserSubscription.data;

  // Enhanced discount calculation with validation
  const getDiscountSafely = () => {
    try {
      return paymentState.getDiscount();
    } catch (error) {
      console.error('Error calculating discount:', error);
      setPaymentError('خطأ في حساب الخصم');
      return 0;
    }
  };

  const discount = getDiscountSafely();
  const finalAmount = Math.max(0, baseAmount - discount);

  // Enhanced payment handler with comprehensive error handling
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setPaymentError(null);
    setIsProcessing(true);
    
    try {
      // Validate payment method
      if (!paymentState.paymentMethod) {
        throw new Error('يرجى اختيار طريقة دفع');
      }

      // Validate payment data based on method
      const { paymentData, paymentMethod } = paymentState;
      
      if (paymentMethod === 'credit_card') {
        if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
          throw new Error('يرجى ملء جميع بيانات البطاقة الائتمانية');
        }
        
        // Basic card validation
        if (paymentData.cardNumber.length < 13 || paymentData.cardNumber.length > 19) {
          throw new Error('رقم البطاقة غير صحيح');
        }
        
        if (paymentData.cvv.length < 3 || paymentData.cvv.length > 4) {
          throw new Error('رقم CVV غير صحيح');
        }
      } else if (paymentMethod === 'jawwal_pay') {
        if (!paymentData.phoneNumber) {
          throw new Error('يرجى إدخال رقم الهاتف لـ JawwalPay');
        }
        
        // Validate Palestinian phone number format
        const phoneRegex = /^(059|056|057)\d{7}$/;
        if (!phoneRegex.test(paymentData.phoneNumber.replace(/\D/g, ''))) {
          throw new Error('رقم الهاتف غير صحيح');
        }
      } else if (paymentMethod === 'bank_transfer' && !paymentData.accountNumber) {
                   throw new Error('يرجى إدخال رقم الحساب البنكي');
             }

      // Validate final amount
      if (finalAmount <= 0) {
        throw new Error('مبلغ الدفع غير صحيح');
      }

      // Check if user already has an active subscription for yearly plans
      if (subscriptionTier === 'yearly' && subscription?.status === 'active') {
        const confirmUpgrade = window.confirm('لديك اشتراك نشط بالفعل. هل تريد الترقية للاشتراك السنوي؟');
        if (!confirmUpgrade) {
          return;
        }
      }

      await processPayment(
        paymentMethod,
        paymentData,
        finalAmount,
        servicesNeeded,
        subscriptionTier
      );

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'حدث خطأ في عملية الدفع';
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced validation for payment completion
  const canProceedWithPayment = () => {
    const { paymentData, paymentMethod } = paymentState;
    
    if (!paymentMethod) return false;
    
    switch (paymentMethod) {
      case 'credit_card':
        return !!(paymentData.cardNumber && paymentData.expiryDate && 
                  paymentData.cvv && paymentData.cardholderName);
      case 'jawwal_pay':
        return !!paymentData.phoneNumber;
      case 'bank_transfer':
        return !!paymentData.accountNumber;
      case 'reflect':
        return true; // Reflect handles its own validation
      default:
        return false;
    }
  };

  // Clear errors when payment data changes
  useEffect(() => {
    if (paymentError) {
      setPaymentError(null);
    }
  }, [paymentState.paymentMethod, paymentState.paymentData]);

  return {
    serviceData,
    servicesNeeded,
    baseAmount,
    finalAmount,
    subscriptionTier,
    ...paymentState,
    handlePayment,
    subscription,
    isCreatingTransaction: isCreatingTransaction || isProcessing,
    navigate,
    paymentError,
    canProceedWithPayment: canProceedWithPayment(),
    isProcessing,
    subscriptionToGet
  };
};