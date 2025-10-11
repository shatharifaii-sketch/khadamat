import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CouponInputProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: any;
  isValidating: boolean;
  validateCoupon: (code: string, userId: string) => Promise<void>;
  removeCoupon: () => void;
}

const CouponInput = ({
  couponCode,
  setCouponCode,
  appliedCoupon,
  isValidating,
  validateCoupon,
  removeCoupon
}: CouponInputProps) => {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState(couponCode);

  const handleApplyCoupon = () => {
    if (user && inputValue.trim()) {
      validateCoupon(inputValue, user.id);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setCouponCode(value);
  };

  return (
    <Card className="border-dashed border-2 border-muted">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Ticket className="text-primary" size={20} />
            <Label className="text-sm font-medium">كود الخصم (اختياري)</Label>
          </div>
          
          {appliedCoupon?.valid ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-600 text-white">
                  {inputValue}
                </Badge>
                <span className="text-sm text-green-700">
                  خصم {appliedCoupon.coupon_type === 'percentage' ? `${appliedCoupon.discount_percentage}%` : `${appliedCoupon.discount_amount} شيكل`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="أدخل كود الخصم"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="flex-1"
                disabled={isValidating}
              />
              <Button
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={!inputValue.trim() || isValidating}
                className="whitespace-nowrap"
              >
                {isValidating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'تطبيق'
                )}
              </Button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            أدخل كود الخصم للحصول على تخفيض على سعر الاشتراك
            <br />
            هذا الكوبون سيتم تطبيقه مرة واحدة فقط عند الدفع لأول مرة.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponInput;