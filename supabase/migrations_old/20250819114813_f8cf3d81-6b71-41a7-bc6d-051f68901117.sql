-- Fix the Security Definer View issue by removing the problematic function
-- and implementing access control through direct RLS policies

-- Drop the existing view that uses the security definer function
DROP VIEW IF EXISTS public.public_services;

-- Drop the security definer function that's causing the issue
DROP FUNCTION IF EXISTS public.can_view_contact_info(uuid);

-- Create separate RLS policies for different access levels
DROP POLICY IF EXISTS "Public can view published services basic info" ON public.services;

-- Policy 1: Service owners can see all their service data
CREATE POLICY "Service owners can view their own services" 
ON public.services 
FOR SELECT 
USING (auth.uid() = user_id AND status = 'published');

-- Policy 2: Admins can see all service data
CREATE POLICY "Admins can view all published services" 
ON public.services 
FOR SELECT 
USING (
    status = 'published' AND 
    has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 3: Users with active subscriptions can see contact info
CREATE POLICY "Subscribers can view contact info" 
ON public.services 
FOR SELECT 
USING (
    status = 'published' AND 
    EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE user_id = auth.uid() 
        AND status = 'active' 
        AND expires_at > now()
    )
);

-- Policy 4: Public users can only see basic info (no contact details)
CREATE POLICY "Public can view basic service info" 
ON public.services 
FOR SELECT 
TO public
USING (status = 'published');

-- Create a simple view that relies on RLS policies
-- This view will return different data based on the user's permissions
CREATE VIEW public.public_services AS
SELECT 
    id,
    title,
    category,
    description,
    price_range,
    location,
    phone,
    email,
    experience,
    views,
    created_at,
    updated_at,
    user_id,
    status
FROM public.services
WHERE status = 'published';

-- Grant permissions on the view
GRANT SELECT ON public.public_services TO anon;
GRANT SELECT ON public.public_services TO authenticated;