-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider_id ON public.conversations(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

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