
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tag, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CouponInputProps {
  onCouponApplied: (coupon: AppliedCoupon | null) => void;
  appliedCoupon: AppliedCoupon | null;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  type: string;
  discount_amount: number;
  description?: string;
}

const CouponInput = ({ onCouponApplied, appliedCoupon }: CouponInputProps) => {
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateCoupon = async () => {
    if (!couponCode.trim() || !user) return;

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        coupon_code: couponCode.toUpperCase(),
        user_id: user.id
      });

      if (error) {
        console.error('Error validating coupon:', error);
        toast.error('حدث خطأ في التحقق من كود الخصم');
        return;
      }

      const result = data[0];
      if (result.valid) {
        const appliedCouponData: AppliedCoupon = {
          id: result.coupon_id,
          code: couponCode.toUpperCase(),
          type: result.coupon_type,
          discount_amount: result.discount_amount
        };
        onCouponApplied(appliedCouponData);
        toast.success(result.message);
        setCouponCode('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error('حدث خطأ في التحقق من كود الخصم');
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    onCouponApplied(null);
    toast.success('تم إلغاء كود الخصم');
  };

  const getCouponDescription = (type: string, discount: number) => {
    switch (type) {
      case 'first_month_free':
        return 'الشهر الأول مجاناً';
      case 'three_months_for_one':
        return '3 أشهر بسعر شهر واحد';
      default:
        return `خصم ${discount} شيكل`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag size={20} className="text-green-600" />
        <Label className="font-semibold">كود الخصم</Label>
      </div>

      {appliedCoupon ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {appliedCoupon.code}
                  </Badge>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {getCouponDescription(appliedCoupon.type, appliedCoupon.discount_amount)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeCoupon}
              className="text-green-600 hover:text-green-800"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="أدخل كود الخصم"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
            className="flex-1"
          />
          <Button
            onClick={validateCoupon}
            disabled={!couponCode.trim() || isValidating}
            variant="outline"
          >
            {isValidating ? 'جاري التحقق...' : 'تطبيق'}
          </Button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="text-blue-600" size={16} />
          <span className="font-semibold text-blue-800 text-sm">أكواد خصم متاحة:</span>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>FIRSTFREE</strong> - الشهر الأول مجاناً</p>
          <p>• <strong>3FOR1</strong> - 3 أشهر بسعر شهر واحد</p>
        </div>
      </div>
    </div>
  );
};

export default CouponInput;
