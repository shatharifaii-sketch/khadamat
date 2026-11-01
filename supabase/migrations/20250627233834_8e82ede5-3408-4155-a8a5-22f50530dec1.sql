
-- First, insert missing profiles for any services that don't have corresponding profile entries
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
SELECT DISTINCT s.user_id, 'Service Provider', now(), now()
FROM public.services s
LEFT JOIN public.profiles p ON s.user_id = p.id
WHERE p.id IS NULL;

-- Now add the foreign key constraint
ALTER TABLE public.services 
ADD CONSTRAINT fk_services_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
