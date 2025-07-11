
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  services_quota: number;
  status: string;
  created_at: string;
  subscription_tier?: string;
  discount_applied?: number;
  original_amount?: number;
}

export const usePaymentHistory = () => {
  const { user } = useAuth();

  const getPaymentHistory = useQuery({
    queryKey: ['payment-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaymentHistory[];
    },
    enabled: !!user
  });

  return {
    paymentHistory: getPaymentHistory.data || [],
    isLoading: getPaymentHistory.isLoading
  };
};
