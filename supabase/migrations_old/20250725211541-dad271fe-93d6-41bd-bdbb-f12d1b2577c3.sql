-- Fix the get_conversation_details function parameter naming conflict
DROP FUNCTION IF EXISTS public.get_conversation_details(uuid);

CREATE OR REPLACE FUNCTION public.get_conversation_details(p_user_id uuid)
 RETURNS TABLE(id uuid, service_id uuid, client_id uuid, provider_id uuid, status text, last_message_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, service_title text, other_party_name text, conversation_type text, unread_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.service_id,
    c.client_id,
    c.provider_id,
    c.status,
    c.last_message_at,
    c.created_at,
    c.updated_at,
    s.title as service_title,
    CASE 
      WHEN c.client_id = p_user_id THEN COALESCE(pp.full_name, 'مقدم الخدمة')
      ELSE COALESCE(cp.full_name, 'عميل')
    END as other_party_name,
    CASE 
      WHEN c.client_id = p_user_id THEN 'client'
      ELSE 'provider'
    END as conversation_type,
    COALESCE(
      (SELECT COUNT(*) 
       FROM public.messages m 
       WHERE m.conversation_id = c.id 
         AND m.read_at IS NULL 
         AND m.sender_id != p_user_id), 
      0
    ) as unread_count
  FROM public.conversations c
  LEFT JOIN public.services s ON c.service_id = s.id
  LEFT JOIN public.profiles cp ON c.client_id = cp.id
  LEFT JOIN public.profiles pp ON c.provider_id = pp.id
  WHERE c.client_id = p_user_id OR c.provider_id = p_user_id
  ORDER BY c.last_message_at DESC;
END;
$function$