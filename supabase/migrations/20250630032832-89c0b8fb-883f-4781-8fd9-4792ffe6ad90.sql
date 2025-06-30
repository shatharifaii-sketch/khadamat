
-- Create coupons table to store coupon definitions
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('first_month_free', 'three_months_for_one')),
  discount_amount NUMERIC DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT NULL, -- NULL means unlimited
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT
);

-- Create coupon_usage table to track who used which coupons
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  transaction_id UUID REFERENCES public.payment_transactions(id),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  discount_applied NUMERIC NOT NULL DEFAULT 0
);

-- Add Row Level Security (RLS) 
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons (public read access for validation)
CREATE POLICY "Anyone can view active coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (active = true);

-- RLS Policies for coupon_usage (users can only see their own usage)
CREATE POLICY "Users can view their own coupon usage" 
  ON public.coupon_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coupon usage" 
  ON public.coupon_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Insert sample coupons
INSERT INTO public.coupons (code, type, description, discount_percentage) VALUES
  ('FIRSTFREE', 'first_month_free', 'الشهر الأول مجاناً', 100),
  ('3FOR1', 'three_months_for_one', '3 أشهر بسعر شهر واحد', 0);

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  coupon_code TEXT,
  user_id UUID
) RETURNS TABLE(
  valid BOOLEAN,
  coupon_id UUID,
  coupon_type TEXT,
  discount_amount NUMERIC,
  message TEXT
) AS $$
DECLARE
  coupon_record RECORD;
  usage_count INTEGER;
BEGIN
  -- Check if coupon exists and is active
  SELECT * INTO coupon_record 
  FROM public.coupons 
  WHERE code = coupon_code 
    AND active = true 
    AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 0::NUMERIC, 'كود الخصم غير صحيح أو منتهي الصلاحية'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user has already used this coupon
  SELECT COUNT(*) INTO usage_count
  FROM public.coupon_usage
  WHERE coupon_usage.coupon_id = coupon_record.id 
    AND coupon_usage.user_id = validate_coupon.user_id;
  
  IF usage_count > 0 THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 0::NUMERIC, 'لقد استخدمت هذا الكود من قبل'::TEXT;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF coupon_record.usage_limit IS NOT NULL AND coupon_record.used_count >= coupon_record.usage_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 0::NUMERIC, 'تم استنفاد هذا الكود'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount amount
  DECLARE
    discount NUMERIC := 0;
  BEGIN
    IF coupon_record.type = 'first_month_free' THEN
      discount := 10; -- Full amount for first month
    ELSIF coupon_record.type = 'three_months_for_one' THEN
      discount := 20; -- Save 20 NIS (pay 10 instead of 30)
    ELSE
      discount := coupon_record.discount_amount;
    END IF;
    
    RETURN QUERY SELECT true, coupon_record.id, coupon_record.type, discount, 'تم تطبيق كود الخصم بنجاح'::TEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
