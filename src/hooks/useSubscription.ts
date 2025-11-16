import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { json } from 'react-router-dom';
import { useCoupon } from './useCoupon';
import { useState } from 'react';
import { usePaymentLogic } from './usePaymentLogic';

export interface Subscription {
  id: string;
  user_id: string;
  services_allowed: number;
  services_used: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  expires_at: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  auto_bump_service?: boolean;
  billing_cycle: string;
  is_in_trial: boolean;
  trial_expires_at: string;
  is_payment_pastdue: boolean;
  next_payment_date: string;
  last_payment_date: string;
  subscription_ended_at: string;
  used_coupon_on_start: boolean;
  coupon_id?: string;
  subscription_tier: {
    id: string;
    title: string;
    allowed_services: number;
    price_monthly_title: string;
    price_yearly_title: string;
    price_monthly_value: number;
    price_yearly_value: number;
  }
}

export interface PaymentTransaction {
  id?: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id?: string;
  services_quota: number;
  status: string;
  payment_data?: any;
  subscription_tier?: string;
  discount_applied?: number;
  original_amount?: number;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { appliedCoupon } = useCoupon();
  const [token, setToken] = useState<string | null>(null);

  // Get user's current subscription
  const getUserSubscription = useSuspenseQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
            
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`*, 
          subscription_tier:subscriptions_tier_id_fkey (
            id,
            title,
            allowed_services,
            price_monthly_title,
            price_yearly_title,
            price_monthly_value,
            price_yearly_value
          )`)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        throw error;
      }
      
      return data as Subscription | null;
    },
  });

  const getUserSubscriptions = useSuspenseQuery({
    queryKey: ['user-subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return null;
            
      const { data: activeSubscription, error: activeSubscriptionError } = await supabase
        .from('subscriptions')
        .select(`*, 
          subscription_tier:subscriptions_tier_id_fkey (
            id,
            title,
            allowed_services,
            price_monthly_title,
            price_yearly_title,
            price_monthly_value,
            price_yearly_value
          )`)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (activeSubscriptionError && activeSubscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', activeSubscriptionError);
        throw activeSubscriptionError;
      }

      const { data: inactiveSubscriptions, error: inactiveSubscriptionsError } = await supabase
        .from('subscriptions')
        .select(`*, 
          subscription_tier:subscriptions_tier_id_fkey (
            id,
            title,
            allowed_services,
            price_monthly_title,
            price_yearly_title,
            price_monthly_value,
            price_yearly_value
          )`)
        .eq('user_id', user.id)
        .eq('status', 'inactive');

      if (inactiveSubscriptionsError && inactiveSubscriptionsError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', inactiveSubscriptionsError);
        throw inactiveSubscriptionsError;
      }
      
      return { 
        activeSubscription, 
        inactiveSubscriptions 
      } as {
        activeSubscription: Subscription;
        inactiveSubscriptions: Subscription[];
      };
    },
  });

  /*
  // Create payment transaction
  const createPaymentTransaction = useMutation({
    mutationFn: async (transactionData: Omit<PaymentTransaction, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User must be authenticated');
      
      console.log('Creating payment transaction:', transactionData);
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          ...transactionData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment transaction:', error);
        throw error;
      }
      
      console.log('Payment transaction created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
    },
    onError: (error: any) => {
      console.error('Error creating payment transaction:', error);
      toast.error('حدث خطأ في معالجة الدفع: ' + error.message);
    }
  });

  // Complete payment (update status to completed)
  const completePayment = useMutation({
    mutationFn: async ({ transactionId, externalTransactionId }: { transactionId: string, externalTransactionId?: string }) => {
      console.log('Completing payment:', transactionId);
      
      // Get transaction details to check for coupon info
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transactionError) {
        console.error('Error fetching transaction:', transactionError);
        throw transactionError;
      }

      // Update transaction status
      const { data, error } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          transaction_id: externalTransactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        console.error('Error completing payment:', error);
        throw error;
      }

      // Create or update subscription after successful payment
      console.log('Creating subscription for completed payment:', transaction);
      
      const paymentData = transaction.payment_data as any;
      const subscriptionMonths = paymentData?.subscription_months || 1;
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + subscriptionMonths);
      
      // Create or update subscription
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user?.id,
          services_allowed: transaction.services_quota,
          services_used: 0, // Reset to 0 for new subscription
          amount: transaction.amount,
          currency: transaction.currency,
          payment_method: transaction.payment_method,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        throw subscriptionError;
      }

      console.log('Subscription created successfully for user:', user?.id);
      
      console.log('Payment completed:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
      toast.success('تم الدفع بنجاح! يمكنك الآن نشر خدماتك.');
    },
    onError: (error: any) => {
      console.error('Error completing payment:', error);
      toast.error('حدث خطأ في إتمام الدفع: ' + error.message);
    }
  });
  */

  // Check if user can post more services
  const {data:canPostService} = useQuery({
    queryKey: ['can-post-service', user?.id],
    queryFn: async () => {
    const subscription = getUserSubscription.data;
    if (!subscription || !user) return {
      user: false,
      subscription: false,
      canPost: false
    };
    
    // Get actual count of user's services
    const { data: userServices, error } = await supabase
      .from('services')
      .select('id')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error checking user services for quota:', error);
      return {
        user: true,
        subscription: true,
        canPost: false
      };
    }
    
    const currentServiceCount = userServices?.length || 0;
    
    return {
      user: true,
      subscription: true,
      canPost: currentServiceCount < subscription.services_allowed
    };
  }
  })

  const createNewSubscription = useMutation({
    mutationKey: ['create-new-subscription'],
    mutationFn: async ({ subscriptionTierId, billingCycle, finalAmount }: { subscriptionTierId: string, billingCycle: string, finalAmount: number }) => {
      const { data: {session} } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: user?.id,
          subscription_tier_id: subscriptionTierId,
          billing_cycle: billingCycle,
          used_coupon_on_start: !!appliedCoupon?.valid,
          coupon_id: appliedCoupon?.valid ? appliedCoupon.coupon_id : null,
          final_amount: finalAmount
        })
      });

      if (!response.ok) {
        console.log('Error creating new subscription:', response);
        throw new Error('error');
      }

      const data = await response.json();

      return data.subscription;
    },
    onSuccess() {
        queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
        toast.success('تم انشاء الاشتراك بنجاح! يمكنك الآن نشر خدماتك.');
    },
    onError(error: any) {
      console.error('Error creating new subscription:', error);
      toast.error('حدث خطاء في انشاء الاشتراك: ' + error.message);
    },
  })

  const deactivateSubscription = useMutation({
    mutationKey: ['deactivate-subscription'],
    mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
      if (!user?.id) throw new Error('User not authenticated.');

    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'inactive',
        subscription_ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    console.log('Deactivating subscription:', subscriptionId);

    if (error) throw error;

    return json({ success: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions', user?.id] });
      toast.success('تم انهاء الاشتراك بنجاح!.');
    },
    onError(error: any) {
      console.error('Error deactivating subscription:', error);
      toast.error('حدث خطاء في انهاء الاشتراك: ' + error.message);
    },
  })

  return {
    getUserSubscription,
    getUserSubscriptions,
    //createPaymentTransaction,
    //completePayment,
    canPostService,
    canPost: getUserSubscription.data?.status === 'active' || getUserSubscription.data,
    //isCreatingTransaction: createPaymentTransaction.isPending,
    //isCompletingPayment: completePayment.isPending,
    createNewSubscription,
    creatingNewSubscription: createNewSubscription.isPending,
    createNewSubscriptionError: createNewSubscription.error,
    createnNewSubscriptionSuccess: createNewSubscription.isSuccess,
    deactivateSubscription,
    deactivatingSubscription: deactivateSubscription.isPending,
    deactivatingSubscriptionError: deactivateSubscription.error,
    deactivateSubscriptionSuccess: deactivateSubscription.isSuccess,
  };
};
