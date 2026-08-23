
-- Update OTP expiry to recommended 10 minutes for better security
-- Using proper timestamp type instead of text
UPDATE public.otp_settings 
SET otp_expiry = NOW() + INTERVAL '10 minutes'
WHERE otp_expiry IS NOT NULL;

-- Set a default expiry for any records without an expiry set
UPDATE public.otp_settings 
SET otp_expiry = NOW() + INTERVAL '10 minutes'
WHERE otp_expiry IS NULL;

-- Add a constraint to ensure future OTP expiry times don't exceed 15 minutes
-- Using a trigger instead of CHECK constraint for time-based validation
CREATE OR REPLACE FUNCTION validate_otp_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the expiry time is more than 15 minutes from now
  IF (NEW.otp_expiry > NOW() + INTERVAL '15 minutes') THEN
    RAISE EXCEPTION 'OTP expiry cannot exceed 15 minutes from current time';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS check_otp_expiry_trigger ON public.otp_settings;
CREATE TRIGGER check_otp_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.otp_settings
  FOR EACH ROW
  EXECUTE FUNCTION validate_otp_expiry();
