
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
  const subscriptionTier = location.state?.subscriptionTier || 'monthly';
  const servicesNeeded = 1; // Always 1 service per subscription
  const baseAmount = subscriptionTier === 'yearly' ? 100 : 10; // 100 NIS for yearly, 10 NIS for monthly

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  const subscription = getUserSubscription.data;

  // Apply coupon discount if available
  const discount = paymentState.getDiscount();
  const finalAmount = Math.max(0, baseAmount - discount);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await processPayment(
      paymentState.paymentMethod,
      paymentState.paymentData,
      finalAmount,
      servicesNeeded,
      subscriptionTier
    );
  };

  return {
    serviceData,
    servicesNeeded,
    baseAmount,
    finalAmount,
    subscriptionTier,
    ...paymentState,
    handlePayment,
    subscription,
    isCreatingTransaction,
    navigate
  };
};
