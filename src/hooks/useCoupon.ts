import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CouponValidation {
  valid: boolean;
  coupon_id?: string;
  coupon_type?: string;
  discount_amount?: number;
  discount_percentage?: number;
  message: string;
}

export const useCoupon = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateCoupon = async (code: string, userId: string) => {
    if (!code.trim()) {
      setAppliedCoupon(null);
      return;
    }

    setIsValidating(true);
    try {
      // Check rate limit first
      const { data: rateLimitData, error: rateLimitError } = await supabase
        .rpc('check_rate_limit', {
          _user_id: userId,
          _action_type: 'coupon_validation',
          _max_attempts: 5,
          _window_minutes: 15
        });

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
        // Continue with validation if rate limit check fails
      } else if (rateLimitData === false) {
        setAppliedCoupon({ valid: false, message: 'تم تجاوز الحد المسموح من المحاولات. حاول مرة أخرى بعد 15 دقيقة' });
        toast.error('تم تجاوز الحد المسموح من المحاولات. حاول مرة أخرى بعد 15 دقيقة');
        return;
      }

      const { data, error } = await supabase
        .rpc('validate_coupon', { 
          coupon_code: code.trim().toUpperCase(), 
          user_id: userId 
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        setAppliedCoupon(result);
        
        if (result.valid) {
          toast.success(`تم تطبيق الكوبون! خصم ${result.discount_amount} شيكل`);
        } else {
          toast.error(result.message);
        }
      } else {
        setAppliedCoupon({ valid: false, message: 'كوبون غير صالح' });
        toast.error('كوبون غير صالح');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setAppliedCoupon({ valid: false, message: 'حدث خطأ في التحقق من الكوبون' });
      toast.error('حدث خطأ في التحقق من الكوبون');
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    toast.success('تم إزالة الكوبون');
  };

  const getDiscount = () => {
    if (!appliedCoupon?.valid) return 0;

    if (appliedCoupon?.coupon_type === 'percentage') {
      return appliedCoupon.discount_percentage > 0 ? appliedCoupon.discount_percentage : appliedCoupon.discount_amount;
    }

    return appliedCoupon.discount_amount;
  };

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    isValidating,
    validateCoupon,
    removeCoupon,
    getDiscount,
  };
};