
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppliedCoupon } from '@/components/Payment/CouponInput';
import { toast } from 'sonner';

export const useCouponLogic = () => {
  const { user } = useAuth();

  const recordCouponUsage = async (couponId: string, transactionId?: string, appliedCoupon?: AppliedCoupon | null) => {
    if (!appliedCoupon || !user) return;

    try {
      await supabase
        .from('coupon_usage')
        .insert({
          user_id: user.id,
          coupon_id: couponId,
          transaction_id: transactionId,
          discount_applied: appliedCoupon.discount_amount
        });

      // Get current coupon data and increment used count
      const { data: couponData, error: fetchError } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', couponId)
        .single();

      if (fetchError) {
        console.error('Error fetching coupon:', fetchError);
        return;
      }

      // Update coupon used count
      await supabase
        .from('coupons')
        .update({ used_count: (couponData.used_count || 0) + 1 })
        .eq('id', couponId);
    } catch (error) {
      console.error('Error recording coupon usage:', error);
    }
  };

  const handleFreeSubscription = async (appliedCoupon: AppliedCoupon | null, servicesNeeded: number) => {
    if (!appliedCoupon || appliedCoupon.type !== 'first_month_free' || !user) return false;

    try {
      // Create subscription directly without payment
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          services_allowed: servicesNeeded,
          services_used: 0,
          amount: 0,
          payment_method: 'coupon',
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      await recordCouponUsage(appliedCoupon.id, undefined, appliedCoupon);
      toast.success('تم تفعيل اشتراكك المجاني! يمكنك الآن نشر خدماتك.');
      return true;
    } catch (error) {
      console.error('Error creating free subscription:', error);
      toast.error('حدث خطأ في تفعيل الاشتراك المجاني');
      return false;
    }
  };

  return {
    recordCouponUsage,
    handleFreeSubscription
  };
};
