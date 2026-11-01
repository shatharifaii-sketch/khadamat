-- Create role-based admin system to replace hardcoded email checks

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update admin RLS policies to use role-based system

-- Update service_analytics admin policy
DROP POLICY IF EXISTS "Admins can view all service analytics" ON public.service_analytics;
CREATE POLICY "Admins can view all service analytics" ON public.service_analytics
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Update search_analytics admin policy  
DROP POLICY IF EXISTS "Admins can view all search analytics" ON public.search_analytics;
CREATE POLICY "Admins can view all search analytics" ON public.search_analytics
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Update conversation_analytics admin policy
DROP POLICY IF EXISTS "Admins can view all conversation analytics" ON public.conversation_analytics;
CREATE POLICY "Admins can view all conversation analytics" ON public.conversation_analytics
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Update user_activity admin policy
DROP POLICY IF EXISTS "Admins can view all user activity" ON public.user_activity;
CREATE POLICY "Admins can view all user activity" ON public.user_activity
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Update admin_audit_log admin policy
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.admin_audit_log;
CREATE POLICY "Admins can view all audit logs" ON public.admin_audit_log
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Add contact form rate limiting
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  submissions_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on contact rate limits
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy to allow contact form rate limiting checks
CREATE POLICY "Anyone can check contact rate limits" ON public.contact_rate_limits
FOR ALL USING (true);

-- Function to check contact form rate limiting
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(_ip_address inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _current_submissions integer := 0;
  _window_start timestamp with time zone := now() - INTERVAL '1 hour';
  _max_submissions integer := 5; -- 5 submissions per hour
BEGIN
  -- Clean up old rate limit records
  DELETE FROM public.contact_rate_limits 
  WHERE window_start < _window_start;
  
  -- Count current submissions
  SELECT COALESCE(SUM(submissions_count), 0) INTO _current_submissions
  FROM public.contact_rate_limits
  WHERE ip_address = _ip_address
    AND window_start >= _window_start;
  
  -- Check if limit exceeded
  IF _current_submissions >= _max_submissions THEN
    RETURN false;
  END IF;
  
  -- Record this submission
  INSERT INTO public.contact_rate_limits (ip_address, submissions_count, window_start)
  VALUES (_ip_address, 1, now())
  ON CONFLICT (ip_address) 
  DO UPDATE SET 
    submissions_count = public.contact_rate_limits.submissions_count + 1,
    window_start = CASE 
      WHEN public.contact_rate_limits.window_start < now() - INTERVAL '1 hour' 
      THEN now() 
      ELSE public.contact_rate_limits.window_start 
    END;
  
  RETURN true;
END;
$$;

-- Insert default admin user (replace with your actual admin email)
-- This will need to be manually updated with the correct user_id after account creation
INSERT INTO public.user_roles (user_id, role) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;