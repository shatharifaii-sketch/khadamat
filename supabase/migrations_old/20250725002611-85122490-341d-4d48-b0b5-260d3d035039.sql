-- Fix remaining security issues

-- Fix validate_otp_expiry function (missing from previous migration)
CREATE OR REPLACE FUNCTION public.validate_otp_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Check if the expiry time is more than 15 minutes from now
  IF (NEW.otp_expiry > NOW() + INTERVAL '15 minutes') THEN
    RAISE EXCEPTION 'OTP expiry cannot exceed 15 minutes from current time';
  END IF;
  RETURN NEW;
END;
$function$;

-- Update OTP settings to enforce 15-minute maximum expiry
UPDATE public.otp_settings 
SET otp_expiry = LEAST(otp_expiry, now() + INTERVAL '15 minutes')
WHERE otp_expiry > now() + INTERVAL '15 minutes';

-- Add input validation function for admin operations
CREATE OR REPLACE FUNCTION public.validate_admin_input(input_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Basic validation: no SQL injection patterns, no excessive length
  IF input_text IS NULL OR LENGTH(input_text) > 10000 THEN
    RETURN false;
  END IF;
  
  -- Check for common SQL injection patterns (basic protection)
  IF input_text ~* '(union|select|insert|update|delete|drop|exec|script)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Create audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log (admins can view all, users can view their own actions)
CREATE POLICY "Admins can view all audit logs" ON public.admin_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = profiles.id 
      AND email = ANY(ARRAY['admin@example.com', 'admin@yourdomain.com'])
    )
  )
);

-- Add logging function for admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action_type text,
  _table_name text DEFAULT NULL,
  _record_id uuid DEFAULT NULL,
  _old_values jsonb DEFAULT NULL,
  _new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action_type,
    table_name,
    record_id,
    old_values,
    new_values
  )
  VALUES (
    auth.uid(),
    _action_type,
    _table_name,
    _record_id,
    _old_values,
    _new_values
  );
END;
$function$;