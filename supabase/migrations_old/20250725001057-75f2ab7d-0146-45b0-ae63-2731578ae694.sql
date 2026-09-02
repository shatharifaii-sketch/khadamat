-- Create coupon validation function
CREATE OR REPLACE FUNCTION validate_coupon(coupon_code text, user_id uuid)
RETURNS TABLE(
  valid boolean,
  coupon_id uuid,
  coupon_type text,
  discount_amount numeric,
  message text
) AS $$
BEGIN
  -- Check if coupon exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM coupons 
    WHERE code = coupon_code 
    AND active = true 
    AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 0::numeric, 'كوبون غير صالح أو منتهي الصلاحية'::text;
    RETURN;
  END IF;

  -- Check if coupon has usage limit and is not exceeded
  IF EXISTS (
    SELECT 1 FROM coupons 
    WHERE code = coupon_code 
    AND usage_limit IS NOT NULL 
    AND used_count >= usage_limit
  ) THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 0::numeric, 'تم استنفاد استخدامات هذا الكوبون'::text;
    RETURN;
  END IF;

  -- Check if user has already used this coupon
  IF EXISTS (
    SELECT 1 FROM coupon_usage cu
    JOIN coupons c ON cu.coupon_id = c.id
    WHERE c.code = coupon_code AND cu.user_id = validate_coupon.user_id
  ) THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 0::numeric, 'لقد استخدمت هذا الكوبون من قبل'::text;
    RETURN;
  END IF;

  -- Return valid coupon info
  RETURN QUERY 
  SELECT 
    true,
    c.id,
    c.type,
    COALESCE(c.discount_amount, 0),
    'كوبون صالح'::text
  FROM coupons c
  WHERE c.code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;