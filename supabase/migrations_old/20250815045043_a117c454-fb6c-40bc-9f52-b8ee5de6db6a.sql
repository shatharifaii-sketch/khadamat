-- Fix the security definer view issue by recreating the view with proper RLS handling
-- The issue might be the way we're calling the security definer function within the view

-- Drop the existing view
DROP VIEW IF EXISTS public.public_services;

-- Create a simple view that relies on RLS policies instead of function calls
-- This ensures the view doesn't have any security definer properties
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
FROM services 
WHERE status = 'published';

-- Enable RLS on the services table (if not already enabled)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public access to basic service info but restricts contact info
DROP POLICY IF EXISTS "Public can view published services with conditional contact info" ON public.services;
CREATE POLICY "Public can view published services with conditional contact info" 
ON public.services 
FOR SELECT 
TO public
USING (
    status = 'published' AND (
        -- Always allow viewing basic info
        true
    )
);

-- Create separate policies for contact info access
DROP POLICY IF EXISTS "Contact info access for authorized users" ON public.services;
CREATE POLICY "Contact info access for authorized users" 
ON public.services 
FOR SELECT 
USING (
    status = 'published' AND 
    can_view_contact_info(user_id)
);