-- First, let's create admin role for the specific admin user
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'shatharifaii@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update profiles RLS policy to allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update services RLS policy to allow admins to view all services
DROP POLICY IF EXISTS "Admins can view all services" ON public.services;
CREATE POLICY "Admins can view all services" 
ON public.services 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to create users (update profiles)
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any service
DROP POLICY IF EXISTS "Admins can update all services" ON public.services;
CREATE POLICY "Admins can update all services" 
ON public.services 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));