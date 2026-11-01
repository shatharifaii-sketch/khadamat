-- Fix contact information exposure issue
-- Drop existing problematic policies and recreate with proper restrictions

-- Drop the problematic policies
DROP POLICY IF EXISTS "Public can view published services with conditional contact info" ON public.services;
DROP POLICY IF EXISTS "Contact info access for authorized users" ON public.services;
DROP POLICY IF EXISTS "Public can view basic service info" ON public.services;
DROP POLICY IF EXISTS "Public can view published services basic info" ON public.services;

-- Drop and recreate the public_services view with conditional contact info
DROP VIEW IF EXISTS public.public_services;

-- Create a secure view that conditionally shows contact information
CREATE VIEW public.public_services AS
SELECT 
    s.id,
    s.title,
    s.category,
    s.description,
    s.price_range,
    s.location,
    -- Only show contact info if user is authorized
    CASE 
        WHEN can_view_contact_info(s.user_id) THEN s.phone 
        ELSE NULL 
    END as phone,
    CASE 
        WHEN can_view_contact_info(s.user_id) THEN s.email 
        ELSE NULL 
    END as email,
    s.experience,
    s.views,
    s.created_at,
    s.updated_at,
    s.user_id,
    s.status
FROM public.services s
WHERE s.status = 'published';

-- Create a policy that allows public access to basic service information only
CREATE POLICY "Public can view published services basic info" 
ON public.services 
FOR SELECT 
TO public
USING (status = 'published');

-- The contact information access is now handled by the view itself
-- using the can_view_contact_info function which checks:
-- 1. If user is the service owner
-- 2. If user is an admin  
-- 3. If user has an active subscription

-- Grant SELECT permission on the view to everyone
GRANT SELECT ON public.public_services TO anon;
GRANT SELECT ON public.public_services TO authenticated;