
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaymentState } from '@/hooks/usePaymentState';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';

export const usePaymentLogic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getUserSubscription } = useSubscription();
  const paymentState = usePaymentState();
  const { processPayment, isCreatingTransaction } = usePaymentProcessing();
  
  const serviceData = location.state?.serviceData;
  const servicesNeeded = location.state?.servicesNeeded || 2;
  const baseAmount = servicesNeeded * 5; // 5 NIS per service

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  const subscription = getUserSubscription.data;

  // Calculate final amount after coupon
  const finalAmount = paymentState.appliedCoupon 
    ? Math.max(0, baseAmount - paymentState.appliedCoupon.discount_amount)
    : baseAmount;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await processPayment(
      paymentState.paymentMethod,
      paymentState.paymentData,
      paymentState.appliedCoupon,
      finalAmount,
      servicesNeeded
    );
  };

  return {
    serviceData,
    servicesNeeded,
    baseAmount,
    finalAmount,
    ...paymentState,
    handlePayment,
    subscription,
    isCreatingTransaction,
    navigate
  };
};
