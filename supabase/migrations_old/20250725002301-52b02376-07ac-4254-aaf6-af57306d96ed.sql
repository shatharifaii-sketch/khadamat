-- Security fixes: Add proper search_path to all database functions

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Fix update_conversation_last_message function
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Fix update_contact_submission_updated_at function
CREATE OR REPLACE FUNCTION public.update_contact_submission_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix get_top_search_terms function
CREATE OR REPLACE FUNCTION public.get_top_search_terms()
RETURNS TABLE(query text, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    search_query as query,
    COUNT(*) as count
  FROM public.search_analytics
  GROUP BY search_query
  ORDER BY count DESC;
$function$;

-- Fix update_service_provider_status function
CREATE OR REPLACE FUNCTION public.update_service_provider_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- If a service is being published, mark user as service provider
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    UPDATE public.profiles 
    SET is_service_provider = true 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix update_conversation_analytics function
CREATE OR REPLACE FUNCTION public.update_conversation_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Update or insert conversation analytics
    INSERT INTO public.conversation_analytics (
        conversation_id, 
        service_id, 
        client_id, 
        provider_id,
        message_count,
        last_activity_at
    )
    VALUES (
        NEW.conversation_id,
        (SELECT service_id FROM public.conversations WHERE id = NEW.conversation_id),
        (SELECT client_id FROM public.conversations WHERE id = NEW.conversation_id),
        (SELECT provider_id FROM public.conversations WHERE id = NEW.conversation_id),
        1,
        NEW.created_at
    )
    ON CONFLICT (conversation_id) 
    DO UPDATE SET 
        message_count = public.conversation_analytics.message_count + 1,
        last_activity_at = NEW.created_at;
    
    RETURN NEW;
END;
$function$;

-- Fix get_category_analytics function
CREATE OR REPLACE FUNCTION public.get_category_analytics()
RETURNS TABLE(category text, searches bigint, views bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    s.category,
    COALESCE(search_count.searches, 0) as searches,
    COALESCE(view_count.views, 0) as views
  FROM (
    SELECT DISTINCT category FROM public.services WHERE category IS NOT NULL
  ) s
  LEFT JOIN (
    SELECT 
      category,
      COUNT(*) as searches
    FROM public.search_analytics
    WHERE category IS NOT NULL
    GROUP BY category
  ) search_count ON s.category = search_count.category
  LEFT JOIN (
    SELECT 
      s.category,
      COUNT(*) as views
    FROM public.service_analytics sa
    JOIN public.services s ON sa.service_id = s.id
    WHERE sa.action_type = 'view'
    GROUP BY s.category
  ) view_count ON s.category = view_count.category
  ORDER BY (COALESCE(search_count.searches, 0) + COALESCE(view_count.views, 0)) DESC;
$function$;

-- Fix handle_payment_completion function
CREATE OR REPLACE FUNCTION public.handle_payment_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Only process if status changed to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    DECLARE
      expires_date TIMESTAMP WITH TIME ZONE;
      services_quota INTEGER;
    BEGIN
      -- Calculate expiration based on subscription tier
      IF NEW.subscription_tier = 'yearly' THEN
        expires_date := NOW() + INTERVAL '1 year';
        services_quota := 12; -- 12 months of services for yearly
      ELSE
        expires_date := NOW() + INTERVAL '1 month';
        services_quota := 1; -- 1 service for monthly
      END IF;
      
      -- Update user's subscription
      INSERT INTO public.subscriptions (
        user_id, 
        services_allowed, 
        services_used, 
        amount, 
        payment_method, 
        status, 
        expires_at,
        subscription_tier,
        auto_bump_service
      )
      VALUES (
        NEW.user_id, 
        services_quota, 
        0, 
        NEW.amount, 
        NEW.payment_method, 
        'active',
        expires_date,
        NEW.subscription_tier,
        CASE WHEN NEW.subscription_tier = 'yearly' THEN true ELSE false END
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        services_allowed = CASE 
          WHEN NEW.subscription_tier = 'yearly' THEN 12
          ELSE public.subscriptions.services_allowed + 1
        END,
        amount = public.subscriptions.amount + NEW.amount,
        expires_at = expires_date,
        subscription_tier = NEW.subscription_tier,
        auto_bump_service = CASE WHEN NEW.subscription_tier = 'yearly' THEN true ELSE false END,
        updated_at = NOW();
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create rate limiting table for coupon validation
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address inet,
  action_type text NOT NULL,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate_limits
CREATE POLICY "Users can manage their own rate limits" ON public.rate_limits
FOR ALL USING (auth.uid() = user_id);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid DEFAULT NULL,
  _ip_address inet DEFAULT NULL,
  _action_type text DEFAULT 'coupon_validation',
  _max_attempts integer DEFAULT 5,
  _window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  _current_attempts integer := 0;
  _window_start timestamp with time zone := now() - (_window_minutes || ' minutes')::interval;
BEGIN
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE window_start < _window_start;
  
  -- Count current attempts
  SELECT COALESCE(SUM(attempts), 0) INTO _current_attempts
  FROM public.rate_limits
  WHERE action_type = _action_type
    AND window_start >= _window_start
    AND (
      (_user_id IS NOT NULL AND user_id = _user_id) OR
      (_ip_address IS NOT NULL AND ip_address = _ip_address)
    );
  
  -- Check if limit exceeded
  IF _current_attempts >= _max_attempts THEN
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO public.rate_limits (user_id, ip_address, action_type, attempts, window_start)
  VALUES (_user_id, _ip_address, _action_type, 1, now())
  ON CONFLICT (user_id, action_type) 
  WHERE window_start >= _window_start
  DO UPDATE SET attempts = public.rate_limits.attempts + 1;
  
  RETURN true;
END;
$function$;