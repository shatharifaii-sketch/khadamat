import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CouponValidation {
  valid: boolean;
  coupon_id?: string;
  coupon_type?: string;
  discount_amount?: number;
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
    return appliedCoupon?.valid ? appliedCoupon.discount_amount || 0 : 0;
  };

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    isValidating,
    validateCoupon,
    removeCoupon,
    getDiscount
  };
};