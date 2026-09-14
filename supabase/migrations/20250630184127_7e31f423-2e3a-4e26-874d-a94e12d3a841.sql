
-- Update existing users who have published services to be marked as service providers
UPDATE public.profiles 
SET is_service_provider = true, updated_at = now()
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM public.services 
  WHERE status = 'published'
) 
AND (is_service_provider IS NULL OR is_service_provider = false);
