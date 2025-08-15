-- Fix security definer view issue by recreating the public_services view without SECURITY DEFINER
-- This ensures the view runs with the permissions of the querying user, not the view creator

-- Drop the existing view
DROP VIEW IF EXISTS public.public_services;

-- Recreate the view without SECURITY DEFINER property
CREATE VIEW public.public_services AS
SELECT 
    id,
    title,
    category,
    description,
    price_range,
    location,
    -- Only show contact info if user has permission via the security definer function
    CASE 
        WHEN can_view_contact_info(user_id) THEN phone 
        ELSE NULL 
    END AS phone,
    CASE 
        WHEN can_view_contact_info(user_id) THEN email 
        ELSE NULL 
    END AS email,
    experience,
    views,
    created_at,
    updated_at,
    user_id,
    status
FROM services 
WHERE status = 'published';