
-- Update the validate_otp_expiry function to include search_path for security
CREATE OR REPLACE FUNCTION public.validate_otp_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the expiry time is more than 15 minutes from now
  IF (NEW.otp_expiry > NOW() + INTERVAL '15 minutes') THEN
    RAISE EXCEPTION 'OTP expiry cannot exceed 15 minutes from current time';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';
