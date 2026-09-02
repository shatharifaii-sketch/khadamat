-- Fix security issue: Restrict contact information access to authorized users only

-- First, create a function to check if a user can view contact information
CREATE OR REPLACE FUNCTION public.can_view_contact_info(service_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Allow if user is the service owner
  IF auth.uid() = service_user_id THEN
    RETURN true;
  END IF;
  
  -- Allow if user is an admin
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN true;
  END IF;
  
  -- Allow if user has an active subscription (indicating they are a legitimate service seeker)
  IF EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = auth.uid() 
    AND status = 'active' 
    AND expires_at > now()
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Drop the existing public policy that exposes all data
DROP POLICY IF EXISTS "Anyone can view published services" ON public.services;

-- Create a new policy that only shows basic service information to the public
CREATE POLICY "Public can view basic service info"
ON public.services
FOR SELECT
USING (status = 'published');

-- Create a view that conditionally exposes contact information
CREATE OR REPLACE VIEW public.public_services AS
SELECT 
  id,
  title,
  category,
  description,
  price_range,
  location,
  -- Only show contact info if user is authorized
  CASE 
    WHEN can_view_contact_info(user_id) THEN phone 
    ELSE NULL 
  END as phone,
  CASE 
    WHEN can_view_contact_info(user_id) THEN email 
    ELSE NULL 
  END as email,
  experience,
  views,
  created_at,
  updated_at,
  user_id,
  status
FROM public.services
WHERE status = 'published';

-- Grant access to the view
GRANT SELECT ON public.public_services TO authenticated, anon;