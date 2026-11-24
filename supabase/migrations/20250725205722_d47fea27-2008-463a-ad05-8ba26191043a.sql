-- Fix function search path security issue
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_conversation_last_message() SET search_path = '';
ALTER FUNCTION public.update_contact_submission_updated_at() SET search_path = '';
ALTER FUNCTION public.get_top_search_terms() SET search_path = '';
ALTER FUNCTION public.update_service_provider_status() SET search_path = '';
ALTER FUNCTION public.get_category_analytics() SET search_path = '';
ALTER FUNCTION public.validate_coupon(text, uuid) SET search_path = '';
ALTER FUNCTION public.update_conversation_analytics() SET search_path = '';
ALTER FUNCTION public.handle_payment_completion() SET search_path = '';
ALTER FUNCTION public.check_rate_limit(uuid, inet, text, integer, integer) SET search_path = '';
ALTER FUNCTION public.validate_otp_expiry() SET search_path = '';
ALTER FUNCTION public.validate_admin_input(text) SET search_path = '';
ALTER FUNCTION public.log_admin_action(text, text, uuid, jsonb, jsonb) SET search_path = '';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.check_contact_rate_limit(inet) SET search_path = '';

-- Enable realtime for conversations and messages
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add the tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider_id ON public.conversations(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- Create a view for conversations with profile data
CREATE OR REPLACE VIEW public.conversations_with_profiles AS
SELECT 
  c.*,
  s.title as service_title,
  cp.full_name as client_name,
  pp.full_name as provider_name
FROM public.conversations c
LEFT JOIN public.services s ON c.service_id = s.id
LEFT JOIN public.profiles cp ON c.client_id = cp.id
LEFT JOIN public.profiles pp ON c.provider_id = pp.id;

-- Add RLS policy for the view
CREATE POLICY "Users can view their own conversations with profiles"
ON public.conversations_with_profiles
FOR SELECT
USING ((auth.uid() = client_id) OR (auth.uid() = provider_id));

-- Enable RLS on the view
ALTER VIEW public.conversations_with_profiles SET (security_invoker = on);

-- Fix OTP expiry validation to be more strict (5 minutes max)
CREATE OR REPLACE FUNCTION public.validate_otp_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the expiry time is more than 5 minutes from now (recommended)
  IF (NEW.otp_expiry > NOW() + INTERVAL '5 minutes') THEN
    RAISE EXCEPTION 'OTP expiry cannot exceed 5 minutes from current time';
  END IF;
  RETURN NEW;
END;
$$;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_message_as_read(message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.messages 
  SET read_at = now()
  WHERE id = message_id 
    AND read_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.client_id = auth.uid() OR c.provider_id = auth.uid())
        AND messages.sender_id != auth.uid()
    );
END;
$$;

-- Create function to get conversation details efficiently
CREATE OR REPLACE FUNCTION public.get_conversation_details(user_id uuid)
RETURNS TABLE(
  id uuid,
  service_id uuid,
  client_id uuid,
  provider_id uuid,
  status text,
  last_message_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  service_title text,
  other_party_name text,
  conversation_type text,
  unread_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
      WHEN c.client_id = user_id THEN COALESCE(pp.full_name, 'مقدم الخدمة')
      ELSE COALESCE(cp.full_name, 'عميل')
    END as other_party_name,
    CASE 
      WHEN c.client_id = user_id THEN 'client'
      ELSE 'provider'
    END as conversation_type,
    COALESCE(
      (SELECT COUNT(*) 
       FROM public.messages m 
       WHERE m.conversation_id = c.id 
         AND m.read_at IS NULL 
         AND m.sender_id != user_id), 
      0
    ) as unread_count
  FROM public.conversations c
  LEFT JOIN public.services s ON c.service_id = s.id
  LEFT JOIN public.profiles cp ON c.client_id = cp.id
  LEFT JOIN public.profiles pp ON c.provider_id = pp.id
  WHERE c.client_id = user_id OR c.provider_id = user_id
  ORDER BY c.last_message_at DESC;
END;
$$;