
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Subscription, useSubscription } from '@/hooks/useSubscription';
import { usePaymentState } from '@/hooks/usePaymentState';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';
import { useMutation } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

export let billToken = null;

export const usePaymentLogic = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getUserSubscription } = useSubscription();
  const paymentState = usePaymentState();
  //const { processPayment, isCreatingTransaction } = usePaymentProcessing();

  const serviceData = location.state?.serviceData;
  const subscriptionTier = location.state?.subscriptionTier || 'Monthly';
  const servicesNeeded = 1;
  const baseAmount = subscriptionTier === 'yearly' ? 100 : 10;

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getToken = useMutation({
    mutationKey: ['get-payment-url'],
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('User must be authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billPs-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        console.log('Error getting payment url:', response);
        throw new Error('error');
      }

      const data = await response.json();

      console.log(data);

      billToken = data.token;
    }
  })

  const getPaymentUrl = useMutation({
    mutationKey: ['get-payment-url'],
    mutationFn: async (subscription: Tables<'subscription_tiers'>) => {
      
    }
  })

  const subscription = getUserSubscription.data;

  // Apply coupon discount if available
  const discount = paymentState.getDiscount();
  const finalAmount = Math.max(0, baseAmount - discount);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    /*await processPayment(
      paymentState.paymentMethod,
      paymentState.paymentData,
      finalAmount,
      servicesNeeded,
      subscriptionTier
    );*/
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
    //isCreatingTransaction,
    navigate,
    getToken
  };
};
