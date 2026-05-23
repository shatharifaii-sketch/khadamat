
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
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
  // Enhanced fields
  actualDuration?: string;
  hasDiscount?: boolean;
  finalAmount?: number;
  statusText?: string;
  paymentMethodText?: string;
}

export const usePaymentHistory = () => {
  const { user } = useAuth();

  const getPaymentHistory = useSuspenseQuery({
    queryKey: ['payment-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('subscription_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Enhance the payment data with additional calculated fields
      return (data || []).map(payment => ({
              ...payment,
              // Format discount display
              hasDiscount: payment.coupon_used,
              finalAmount: payment.amount,
              originalAmount: /*payment.original_amount ||*/ payment.amount,
              // Status with Arabic translation
              statusText: getStatusText(payment.payment_status),
              // Payment method with Arabic translation  
              paymentMethodText: 'Stripe'
            }));
    },
    refetchInterval: 30000 // Refresh every 30 seconds to catch status updates
  });

  return {
    paymentHistory: getPaymentHistory.data || [],
    isLoading: getPaymentHistory.isLoading,
    refetch: getPaymentHistory.refetch
  };
};

// Helper functions for consistent translation
const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'مكتملة';
    case 'pending': return 'قيد المراجعة';
    case 'failed': return 'فاشلة';
    case 'cancelled': return 'ملغية';
    default: return status;
  }
};

const getPaymentMethodText = (method: string) => {
  switch (method) {
    case 'credit_card': return 'بطاقة ائتمان';
    case 'reflect': return 'ريفلكت';
    case 'jawwal_pay': return 'جوال باي';
    case 'ooredoo': return 'أوريدو';
    case 'bank_transfer': return 'تحويل بنكي';
    case 'free_trial': return 'تجربة مجانية';
    default: return method;
  }
};
