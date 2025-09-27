import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  subscription_tier?: string;
  auto_bump_service?: boolean;
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

  // Get user's current subscription
  const getUserSubscription = useSuspenseQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
            
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        throw error;
      }
      
      return data as Subscription | null;
    },
  });

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

  // Check if user can post more services
  const canPostService = async () => {
    const subscription = getUserSubscription.data;
    if (!subscription || !user) return false;
    
    // Get actual count of user's services
    const { data: userServices, error } = await supabase
      .from('services')
      .select('id')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error checking user services for quota:', error);
      return false;
    }
    
    const currentServiceCount = userServices?.length || 0;
    console.log('Can post service check - Current:', currentServiceCount, 'Allowed:', subscription.services_allowed);
    
    return currentServiceCount < subscription.services_allowed;
  };

  return {
    getUserSubscription,
    createPaymentTransaction,
    completePayment,
    canPostService,
    canPost: getUserSubscription.data?.status === 'active' || getUserSubscription.data,
    isCreatingTransaction: createPaymentTransaction.isPending,
    isCompletingPayment: completePayment.isPending
  };
};
