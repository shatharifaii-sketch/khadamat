
-- Fix search_path security warnings for database functions

-- Update the validate_coupon function to include search_path for security
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = '';

-- Update the handle_payment_completion function to include search_path for security
CREATE OR REPLACE FUNCTION public.handle_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update user's subscription to add the services quota
    INSERT INTO public.subscriptions (user_id, services_allowed, services_used, amount, payment_method, status)
    VALUES (NEW.user_id, NEW.services_quota, 0, NEW.amount, NEW.payment_method, 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      services_allowed = public.subscriptions.services_allowed + NEW.services_quota,
      amount = public.subscriptions.amount + NEW.amount,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = '';
