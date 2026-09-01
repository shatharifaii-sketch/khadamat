

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."activity_type" AS ENUM (
    'login',
    'logout'
);


ALTER TYPE "public"."activity_type" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'moderator',
    'user'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."coupon_type" AS ENUM (
    'first_month_free',
    'three_months_for_one',
    'percentage',
    'fixed'
);


ALTER TYPE "public"."coupon_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_contact_rate_limit"("_ip_address" "inet") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  _current_submissions integer := 0;
  _window_start timestamp with time zone := now() - INTERVAL '1 hour';
  _max_submissions integer := 5; -- 5 submissions per hour
BEGIN
  -- Clean up old rate limit records
  DELETE FROM public.contact_rate_limits 
  WHERE window_start < _window_start;
  
  -- Count current submissions
  SELECT COALESCE(SUM(submissions_count), 0) INTO _current_submissions
  FROM public.contact_rate_limits
  WHERE ip_address = _ip_address
    AND window_start >= _window_start;
  
  -- Check if limit exceeded
  IF _current_submissions >= _max_submissions THEN
    RETURN false;
  END IF;
  
  -- Record this submission
  INSERT INTO public.contact_rate_limits (ip_address, submissions_count, window_start)
  VALUES (_ip_address, 1, now())
  ON CONFLICT (ip_address) 
  DO UPDATE SET 
    submissions_count = public.contact_rate_limits.submissions_count + 1,
    window_start = CASE 
      WHEN public.contact_rate_limits.window_start < now() - INTERVAL '1 hour' 
      THEN now() 
      ELSE public.contact_rate_limits.window_start 
    END;
  
  RETURN true;
END;
$$;


ALTER FUNCTION "public"."check_contact_rate_limit"("_ip_address" "inet") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rate_limit"("_user_id" "uuid" DEFAULT NULL::"uuid", "_ip_address" "inet" DEFAULT NULL::"inet", "_action_type" "text" DEFAULT 'coupon_validation'::"text", "_max_attempts" integer DEFAULT 5, "_window_minutes" integer DEFAULT 15) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$DECLARE
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
  ON CONFLICT (user_id, action_type, window_start) 
  DO UPDATE SET attempts = public.rate_limits.attempts + 1;
  
  RETURN true;
END;$$;


ALTER FUNCTION "public"."check_rate_limit"("_user_id" "uuid", "_ip_address" "inet", "_action_type" "text", "_max_attempts" integer, "_window_minutes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."daily_login_activity"("days_back" integer DEFAULT 30) RETURNS TABLE("day" "date", "user_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select
    d.day,
    coalesce(count(distinct ua.user_id), 0) as user_count
  from
    generate_series(
      current_date - (days_back - 1) * interval '1 day',
      current_date,
      interval '1 day'
    ) as d(day)
    left join user_activity ua
      on ua.activity_type = 'login'
      and ua.created_at::date = d.day
  group by d.day
  order by d.day;
$$;


ALTER FUNCTION "public"."daily_login_activity"("days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_analytics"() RETURNS TABLE("category" "text", "searches" bigint, "views" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."get_category_analytics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_conversation_details"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "service_id" "uuid", "client_id" "uuid", "provider_id" "uuid", "status" "text", "last_message_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "service_title" "text", "other_party_name" "text", "conversation_type" "text", "unread_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
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
$$;


ALTER FUNCTION "public"."get_conversation_details"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_subscription_data_with_stripe"("tier_id" "uuid") RETURNS json
    LANGUAGE "plpgsql"
    AS $$declare
  result json;
begin
select json_build_object(
  'id', st.id,
  'allowed_services', allowed_services,
  'free_trial', st.free_trial,
  'free_trial_period_text', st.free_trial_period_text,

  'stripe_product', json_build_object(
    'id', sp.id,
    'name', sp.name,
    'description', sp.description
  ),

  'stripe_monthly_price', json_build_object(
    'id', sm.id,
    'unit_amount', sm.unit_amount,
    'currency', sm.currency,
    'recurring_interval', sm.attrs->'recurring'->>'interval'
  ),

  'stripe_yearly_price', json_build_object(
    'id', sy.id,
    'unit_amount', sy.unit_amount,
    'currency', sy.currency,
    'recurring_interval', sy.attrs->'recurring'->>'interval'
  )
)
into result
from subscription_tiers st
  left join public.stripe_products sp
    on sp.id = st.stripe_product_id
  left join public.stripe_prices sm
    on sm.id = st.stripe_monthly_price_id
  left join public.stripe_prices sy
    on sy.id = st.stripe_yearly_price_id
  where st.id = tier_id;

return result;
end;$$;


ALTER FUNCTION "public"."get_subscription_data_with_stripe"("tier_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_search_terms"() RETURNS TABLE("query" "text", "count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT 
    search_query as query,
    COUNT(*) as count
  FROM public.search_analytics
  GROUP BY search_query
  ORDER BY count DESC;
$$;


ALTER FUNCTION "public"."get_top_search_terms"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_payment_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_payment_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("uid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists(
    select 1
    from public.user_roles
    where user_id = uid
      and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_admin_action"("_action_type" "text", "_table_name" "text" DEFAULT NULL::"text", "_record_id" "uuid" DEFAULT NULL::"uuid", "_old_values" "jsonb" DEFAULT NULL::"jsonb", "_new_values" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action_type,
    table_name,
    record_id,
    old_values,
    new_values
  )
  VALUES (
    auth.uid(),
    _action_type,
    _table_name,
    _record_id,
    _old_values,
    _new_values
  );
END;
$$;


ALTER FUNCTION "public"."log_admin_action"("_action_type" "text", "_table_name" "text", "_record_id" "uuid", "_old_values" "jsonb", "_new_values" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."login_activity_summary"() RETURNS json
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select json_build_object(
    'today', count(distinct user_id) filter (where created_at::date = current_date),
    'month', count(distinct user_id) filter (where created_at >= date_trunc('month', current_date)),
    'year', count(distinct user_id) filter (where created_at >= date_trunc('year', current_date))
  )
  from user_activity
  where activity_type = 'login';
$$;


ALTER FUNCTION "public"."login_activity_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_message_as_read"("message_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
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


ALTER FUNCTION "public"."mark_message_as_read"("message_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."monthly_login_activity"("months_back" integer DEFAULT 12) RETURNS TABLE("month" "date", "user_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select
    d.month,
    coalesce(count(distinct ua.user_id), 0) as user_count
  from
    generate_series(
        date_trunc('month', current_date) - (months_back - 1) * interval '1 month',
        date_trunc('month', current_date),
        interval '1 month'
    ) as d(month)
    left join user_activity ua
      on ua.activity_type = 'login'
      and date_trunc('month', ua.created_at) = d.month
  group by d.month
  order by d.month;
$$;


ALTER FUNCTION "public"."monthly_login_activity"("months_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_contact_submission_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_contact_submission_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_conversation_analytics"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."update_conversation_analytics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_conversation_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_conversation_last_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_service_provider_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- If a service is being published, mark user as service provider
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    UPDATE public.profiles 
    SET is_service_provider = true 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_service_provider_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_admin_input"("input_text" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Basic validation: no SQL injection patterns, no excessive length
  IF input_text IS NULL OR LENGTH(input_text) > 10000 THEN
    RETURN false;
  END IF;
  
  -- Check for common SQL injection patterns (basic protection)
  IF input_text ~* '(union|select|insert|update|delete|drop|exec|script)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;


ALTER FUNCTION "public"."validate_admin_input"("input_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_coupon"("coupon_code" "text", "user_id" "uuid") RETURNS TABLE("valid" boolean, "coupon_id" "uuid", "coupon_type" "text", "discount_amount" numeric, "discount_percentage" integer, "message" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if coupon exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM coupons 
    WHERE code = coupon_code 
    AND active = true 
    AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 0::numeric, 'كوبون غير صالح أو منتهي الصلاحية'::text;
    RETURN;
  END IF;

  -- Check if coupon has usage limit and is not exceeded
  IF EXISTS (
    SELECT 1 FROM coupons 
    WHERE code = coupon_code 
    AND usage_limit IS NOT NULL 
    AND used_count >= usage_limit
  ) THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 0::numeric, 'تم استنفاد استخدامات هذا الكوبون'::text;
    RETURN;
  END IF;

  -- Check if user has already used this coupon
  IF EXISTS (
    SELECT 1 FROM coupon_usage cu
    JOIN coupons c ON cu.coupon_id = c.id
    WHERE c.code = coupon_code AND cu.user_id = validate_coupon.user_id
  ) THEN
    RETURN QUERY SELECT false, null::uuid, null::text, 0::numeric, 'لقد استخدمت هذا الكوبون من قبل'::text;
    RETURN;
  END IF;

  -- Return valid coupon info
  RETURN QUERY 
  SELECT 
    true,
    c.id,
    c.type::text,
    COALESCE(c.discount_amount, 0),
    COALESCE(c.discount_percentage, 0),
    'كوبون صالح'::text
  FROM coupons c
  WHERE c.code = coupon_code;
END;
$$;


ALTER FUNCTION "public"."validate_coupon"("coupon_code" "text", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_otp_expiry"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Check if the expiry time is more than 15 minutes from now
  IF (NEW.otp_expiry > NOW() + INTERVAL '15 minutes') THEN
    RAISE EXCEPTION 'OTP expiry cannot exceed 15 minutes from current time';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_otp_expiry"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."yearly_login_activity"("years_back" integer DEFAULT 5) RETURNS TABLE("year" "date", "user_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select
    d.year,
    coalesce(count(distinct ua.user_id), 0) as user_count
  from
    generate_series(
        date_trunc('year', current_date) - (years_back - 1) * interval '1 year',
        date_trunc('year', current_date),
        interval '1 year'
    ) as d(year)
    left join user_activity ua
      on ua.activity_type = 'login'
      and date_trunc('year', ua.created_at) = d.year
  group by d.year
  order by d.year;
$$;


ALTER FUNCTION "public"."yearly_login_activity"("years_back" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_user_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "table_name" "text",
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_page_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid",
    "visitor_id" "text" NOT NULL,
    "path" "text" NOT NULL,
    "normalized_path" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "is_mobile" boolean DEFAULT false
);


ALTER TABLE "public"."analytics_page_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visitor_id" "text" NOT NULL,
    "started_at" timestamp without time zone DEFAULT "now"(),
    "last_seen_at" timestamp without time zone DEFAULT "now"(),
    "is_mobile" boolean,
    "user_agent" "text"
);


ALTER TABLE "public"."analytics_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ip_address" "inet" NOT NULL,
    "submissions_count" integer DEFAULT 1,
    "window_start" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subject" "text"
);


ALTER TABLE "public"."contact_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_activity_at" timestamp with time zone DEFAULT "now"(),
    "message_count" integer DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text"
);


ALTER TABLE "public"."conversation_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid",
    "client_id" "uuid" NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "last_message_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "conversations_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text", 'closed'::"text"])))
);

ALTER TABLE ONLY "public"."conversations" REPLICA IDENTITY FULL;


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coupon_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "coupon_id" "uuid" NOT NULL,
    "transaction_id" "uuid",
    "applied_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "discount_applied" numeric DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."coupon_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "type" "public"."coupon_type" NOT NULL,
    "discount_amount" numeric DEFAULT 0,
    "discount_percentage" integer DEFAULT 0,
    "usage_limit" integer,
    "used_count" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "stripe_coupon_id" "text",
    "stripe_promo_id" "text"
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."extra_products" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "price" "text",
    "stripe_product_id" "text",
    "active" boolean DEFAULT true,
    "stripe_price_id" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."extra_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "subscription_transaction_id" "uuid",
    "subscription_id" "uuid",
    "amount" bigint,
    "status" "text",
    "subtotal" bigint,
    "url" "text",
    "stripe_price_id" "text",
    "stripe_product_id" "text",
    "stripe_subscription_id" "text",
    "stripe_customer_id" "text",
    "stripe_subscription_item_id" "text",
    "stripe_invoice_id" "text",
    "billing_reason" "text",
    "currency" "text"
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices_dev" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "subscription_transaction_id" "uuid",
    "subscription_id" "uuid",
    "amount" bigint,
    "status" "text",
    "subtotal" bigint,
    "url" "text",
    "stripe_price_id" "text",
    "stripe_product_id" "text",
    "stripe_subscription_id" "text",
    "stripe_customer_id" "text",
    "stripe_subscription_item_id" "text",
    "stripe_invoice_id" "text",
    "billing_reason" "text",
    "currency" "text"
);


ALTER TABLE "public"."invoices_dev" OWNER TO "postgres";


COMMENT ON TABLE "public"."invoices_dev" IS 'This is a duplicate of invoices';



ALTER TABLE "public"."invoices_dev" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."invoices_dev_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."invoices" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."invoices_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "message_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "file_url" "text",
    "reply_to_id" "uuid",
    CONSTRAINT "messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'system'::"text"])))
);

ALTER TABLE ONLY "public"."messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."otp_settings" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "otp_expiry" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."otp_settings" OWNER TO "postgres";


ALTER TABLE "public"."otp_settings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."otp_settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."password_reset_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "ip" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."password_reset_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" numeric DEFAULT 10.00 NOT NULL,
    "currency" "text" DEFAULT 'ILS'::"text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "discount_applied" numeric DEFAULT 0,
    "original_amount" numeric DEFAULT 0,
    "paid_for" "text"
);


ALTER TABLE "public"."payment_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phone_verification_codes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "phone" "text",
    "code_hash" "text",
    "expires_at" timestamp with time zone,
    "attempts" integer,
    "used" boolean
);


ALTER TABLE "public"."phone_verification_codes" OWNER TO "postgres";


ALTER TABLE "public"."phone_verification_codes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."phone_verification_codes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE IF NOT EXISTS "public"."profiles_user_index_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."profiles_user_index_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bio" "text",
    "experience_years" integer,
    "profile_image_url" "text",
    "is_service_provider" boolean DEFAULT false,
    "stripe_customer_id" "text",
    "user_index" bigint DEFAULT "nextval"('"public"."profiles_user_index_seq"'::"regclass")
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "image_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles_images" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles_images" IS 'images of profiles';



CREATE OR REPLACE VIEW "public"."profiles_with_email" AS
 SELECT "p"."id",
    "p"."full_name",
    "p"."phone",
    "p"."location",
    "p"."created_at",
    "p"."updated_at",
    "p"."bio",
    "p"."experience_years",
    "p"."profile_image_url",
    "p"."is_service_provider",
    "u"."email",
    "p"."user_index"
   FROM ("public"."profiles" "p"
     JOIN "auth"."users" "u" ON (("p"."id" = "u"."id")));


ALTER VIEW "public"."profiles_with_email" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price_range" "text" NOT NULL,
    "location" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "email" "text" NOT NULL,
    "experience" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "views" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_online" boolean DEFAULT false,
    "links" "jsonb" DEFAULT '[]'::"jsonb",
    "whatsapp_number" "text"
);

ALTER TABLE ONLY "public"."services" REPLICA IDENTITY FULL;


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_services" AS
 SELECT "id",
    "title",
    "category",
    "description",
    "price_range",
    "location",
    "phone",
    "email",
    "experience",
    "views",
    "created_at",
    "updated_at",
    "user_id",
    "status"
   FROM "public"."services"
  WHERE ("status" = 'published'::"text");


ALTER VIEW "public"."public_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "ip_address" "inet",
    "action_type" "text" NOT NULL,
    "attempts" integer DEFAULT 1,
    "window_start" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone_number" "text",
    "report_message" "text" NOT NULL,
    "object_type" "text",
    "object_id" "uuid"
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


ALTER TABLE "public"."reports" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."search_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "search_query" "text" NOT NULL,
    "category" "text",
    "location" "text",
    "results_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "inet",
    "user_agent" "text"
);


ALTER TABLE "public"."search_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "action_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "referrer" "text"
);


ALTER TABLE "public"."service_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "name" "text",
    "display_order" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "thumbnail_url" "text"
);


ALTER TABLE "public"."service_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "name" "text",
    "display_order" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "thumbnail_url" "text",
    "type" "text"
);


ALTER TABLE "public"."service_media" OWNER TO "postgres";


COMMENT ON TABLE "public"."service_media" IS 'This is a duplicate of service_images';



CREATE TABLE IF NOT EXISTS "public"."service_reviews" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "service_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "review_body" "text" DEFAULT ''::"text" NOT NULL,
    "rating" numeric DEFAULT '0'::numeric NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."service_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stripe_events" (
    "id" bigint NOT NULL,
    "type" "text",
    "processed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_id" "text"
);


ALTER TABLE "public"."stripe_events" OWNER TO "postgres";


ALTER TABLE "public"."stripe_events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."stipe_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



-- CREATE FOREIGN TABLE "public"."stripe_checkout_sessions" (
--     "id" "text",
--     "customer" "text",
--     "payment_intent" "text",
--     "subscription" "text",
--     "attrs" "jsonb"
-- )
-- SERVER "stripe_server"
-- OPTIONS (
--     "id" '261030',
--     "object" 'checkout/sessions',
--     "rowid_column" 'id',
--     "schema" 'public'
-- );


-- ALTER FOREIGN TABLE "public"."stripe_checkout_sessions" OWNER TO "postgres";


-- CREATE FOREIGN TABLE "public"."stripe_customer_data" (
--     "id" "text",
--     "email" "text",
--     "name" "text",
--     "description" "text",
--     "created" timestamp without time zone,
--     "attrs" "jsonb"
-- )
-- SERVER "stripe_server"
-- OPTIONS (
--     "id" '261036',
--     "object" 'customers',
--     "rowid_column" 'id',
--     "schema" 'public'
-- );


-- ALTER FOREIGN TABLE "public"."stripe_customer_data" OWNER TO "postgres";


-- CREATE FOREIGN TABLE "public"."stripe_invoices" (
--     "id" "text",
--     "status" "text",
--     "total" bigint,
--     "currency" "text",
--     "period_start" timestamp without time zone,
--     "period_end" timestamp without time zone,
--     "attrs" "jsonb",
--     "subscription" "text",
--     "customer" "text"
-- )
-- SERVER "stripe_server"
-- OPTIONS (
--     "id" '261033',
--     "object" 'invoices',
--     "schema" 'public'
-- );


-- ALTER FOREIGN TABLE "public"."stripe_invoices" OWNER TO "postgres";


-- CREATE FOREIGN TABLE "public"."stripe_prices" (
--     "id" "text",
--     "active" boolean,
--     "currency" "text",
--     "product" "text",
--     "unit_amount" bigint,
--     "type" "text",
--     "created" timestamp without time zone,
--     "attrs" "jsonb"
-- )
-- SERVER "stripe_server"
-- OPTIONS (
--     "id" '261042',
--     "object" 'prices',
--     "schema" 'public'
-- );


-- ALTER FOREIGN TABLE "public"."stripe_prices" OWNER TO "postgres";


-- CREATE FOREIGN TABLE "public"."stripe_products" (
--     "id" "text",
--     "name" "text",
--     "active" boolean,
--     "default_price" "text",
--     "description" "text",
--     "created" timestamp without time zone,
--     "updated" timestamp without time zone,
--     "attrs" "jsonb"
-- )
-- SERVER "stripe_server"
-- OPTIONS (
--     "id" '261039',
--     "object" 'products',
--     "rowid_column" 'id',
--     "schema" 'public'
-- );


-- ALTER FOREIGN TABLE "public"."stripe_products" OWNER TO "postgres";


-- CREATE FOREIGN TABLE "public"."stripe_subscriptions" (
--     "attrs" "jsonb",
--     "current_period_end" timestamp without time zone,
--     "customer" "text",
--     "id" "text",
--     "currency" "text",
--     "current_period_start" timestamp without time zone
-- )
-- SERVER "stripe_server"
-- OPTIONS (
--     "id" '261045',
--     "object" 'subscriptions',
--     "rowid_column" 'id',
--     "schema" 'public'
-- );


-- ALTER FOREIGN TABLE "public"."stripe_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tier" bigint,
    "allowed_services" bigint,
    "free_trial" boolean,
    "free_trial_period_text" character varying,
    "free_trial_period" bigint,
    "class_name" character varying,
    "badge_class_name" character varying,
    "users" bigint DEFAULT '0'::bigint NOT NULL,
    "stripe_product_id" "text" NOT NULL,
    "stripe_monthly_price_id" "text" NOT NULL,
    "stripe_yearly_price_id" "text" NOT NULL,
    "price_monthly_title" "text",
    "price_monthly_value" numeric,
    "price_yearly_title" "text",
    "price_yearly_value" numeric,
    "title" "text",
    "notes" json,
    "notes_english" json
);


ALTER TABLE "public"."subscription_tiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_tiers_dev" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tier" bigint,
    "allowed_services" bigint,
    "free_trial" boolean,
    "free_trial_period_text" character varying,
    "free_trial_period" bigint,
    "class_name" character varying,
    "badge_class_name" character varying,
    "users" bigint DEFAULT '0'::bigint NOT NULL,
    "stripe_product_id" "text" NOT NULL,
    "stripe_monthly_price_id" "text" NOT NULL,
    "stripe_yearly_price_id" "text" NOT NULL,
    "price_monthly_title" "text",
    "price_monthly_value" numeric,
    "price_yearly_title" "text",
    "price_yearly_value" numeric,
    "title" "text",
    "notes" json
);


ALTER TABLE "public"."subscription_tiers_dev" OWNER TO "postgres";


COMMENT ON TABLE "public"."subscription_tiers_dev" IS 'This is a duplicate of subscription_tiers';



CREATE TABLE IF NOT EXISTS "public"."subscription_transactions" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subscription_id" "uuid",
    "user_id" "uuid",
    "currency" "text",
    "payment_date" timestamp with time zone,
    "payment_status" "text" DEFAULT 'pending'::"text",
    "billing_period_start" timestamp with time zone,
    "billing_period_end" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "coupon_used" boolean DEFAULT false,
    "coupon_id" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "amount" bigint,
    "stripe_invoice_id" "text",
    "stripe_subscription_id" "text",
    "stripe_subscription_item_id" "text",
    "stripe_price_id" "text",
    "stripe_product_id" "text",
    "stripe_customer_id" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "invoice_url" "text",
    "invoice_id" bigint,
    "billing_reason" "text",
    "email_sent" boolean DEFAULT false
);


ALTER TABLE "public"."subscription_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_transactions_dev" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subscription_id" "uuid",
    "user_id" "uuid",
    "currency" "text",
    "payment_date" timestamp with time zone,
    "payment_status" "text" DEFAULT 'pending'::"text",
    "billing_period_start" timestamp with time zone,
    "billing_period_end" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "coupon_used" boolean DEFAULT false,
    "coupon_id" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "amount" bigint,
    "stripe_invoice_id" "text",
    "stripe_subscription_id" "text",
    "stripe_subscription_item_id" "text",
    "stripe_price_id" "text",
    "stripe_product_id" "text",
    "stripe_customer_id" "text",
    "invoice_url" "text",
    "invoice_id" bigint,
    "billing_reason" "text",
    "email_sent" boolean DEFAULT false,
    "stripe_payment_intent_id" "text",
    "stripe_charge_id" "text",
    "extra_stripe_customer_id" "text"
);


ALTER TABLE "public"."subscription_transactions_dev" OWNER TO "postgres";


COMMENT ON TABLE "public"."subscription_transactions_dev" IS 'This is a duplicate of subscription_transactions';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "amount" numeric(10,2) DEFAULT 10.00 NOT NULL,
    "currency" "text" DEFAULT 'ILS'::"text" NOT NULL,
    "billing_cycle" "text" DEFAULT 'monthly'::"text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '1 mon'::interval) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "services_allowed" integer DEFAULT 2,
    "services_used" integer DEFAULT 0,
    "payment_method" "text" DEFAULT 'credit_card'::"text",
    "auto_renew" boolean DEFAULT false,
    "is_in_trial" boolean DEFAULT true NOT NULL,
    "trial_expires_at" timestamp with time zone,
    "tier_id" "uuid",
    "is_payment_pastdue" boolean DEFAULT false,
    "next_payment_date" timestamp with time zone,
    "last_payment_date" timestamp with time zone,
    "subscription_ended_at" timestamp with time zone,
    "used_coupon_on_start" boolean DEFAULT false,
    "coupon_id" "uuid",
    "stripe_subscription_id" "text",
    "stripe_subscription_item_id" "text",
    "stripe_customer_id" "text",
    "stripe_product_id" "text",
    "stripe_price_id" "text",
    "latest_stripe_invoice_id" "text",
    "stripe_discount_id" "text",
    "stripe_coupon_id" "text",
    "stripe_promotion_id" "text"
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions_dev" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "amount" numeric(10,2) DEFAULT 10.00 NOT NULL,
    "currency" "text" DEFAULT 'ILS'::"text" NOT NULL,
    "billing_cycle" "text" DEFAULT 'monthly'::"text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '1 mon'::interval) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "services_allowed" integer DEFAULT 2,
    "services_used" integer DEFAULT 0,
    "payment_method" "text" DEFAULT 'credit_card'::"text",
    "auto_renew" boolean DEFAULT false,
    "is_in_trial" boolean DEFAULT true NOT NULL,
    "trial_expires_at" timestamp with time zone,
    "tier_id" "uuid",
    "is_payment_pastdue" boolean DEFAULT false,
    "next_payment_date" timestamp with time zone,
    "last_payment_date" timestamp with time zone,
    "subscription_ended_at" timestamp with time zone,
    "used_coupon_on_start" boolean DEFAULT false,
    "coupon_id" "uuid",
    "stripe_subscription_id" "text",
    "stripe_subscription_item_id" "text",
    "stripe_customer_id" "text",
    "stripe_product_id" "text",
    "stripe_price_id" "text",
    "latest_stripe_invoice_id" "text",
    "stripe_discount_id" "text",
    "stripe_coupon_id" "text",
    "stripe_promotion_id" "text"
);


ALTER TABLE "public"."subscriptions_dev" OWNER TO "postgres";


COMMENT ON TABLE "public"."subscriptions_dev" IS 'This is a duplicate of subscriptions';



CREATE TABLE IF NOT EXISTS "public"."table_name" (
    "id" bigint NOT NULL,
    "inserted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "data" "jsonb",
    "name" "text"
);


ALTER TABLE "public"."table_name" OWNER TO "postgres";


ALTER TABLE "public"."table_name" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."table_name_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "activity_type" "public"."activity_type",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "method" "text" DEFAULT 'email'::"text"
);


ALTER TABLE "public"."user_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_reports" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reporter_id" "uuid" DEFAULT "auth"."uid"(),
    "reported_id" "uuid" DEFAULT "gen_random_uuid"(),
    "report_description" "text"
);


ALTER TABLE "public"."user_reports" OWNER TO "postgres";


ALTER TABLE "public"."user_reports" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users_with_extra_products" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "product_id" "uuid",
    "stripe_product_id" "text",
    "stripe_price_id" "text",
    "stripe_customer_id" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "extra_products_count" integer
);


ALTER TABLE "public"."users_with_extra_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."web_analytics" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "path" "text",
    "visitor_id" "text",
    "visit_date" timestamp without time zone,
    "is_new_visit" boolean DEFAULT true,
    "is_mobile" boolean DEFAULT false
);


ALTER TABLE "public"."web_analytics" OWNER TO "postgres";


COMMENT ON TABLE "public"."web_analytics" IS 'Production';



CREATE TABLE IF NOT EXISTS "public"."web_analytics_dev" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "path" "text",
    "visitor_id" "text",
    "visit_date" timestamp without time zone,
    "is_new_visit" boolean DEFAULT true,
    "is_mobile" boolean DEFAULT false
);


ALTER TABLE "public"."web_analytics_dev" OWNER TO "postgres";


ALTER TABLE "public"."web_analytics" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."web_analytics_duplicate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."web_analytics_dev" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."web_analytics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_page_views"
    ADD CONSTRAINT "analytics_page_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_sessions"
    ADD CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_rate_limits"
    ADD CONSTRAINT "contact_rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_submissions"
    ADD CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_analytics"
    ADD CONSTRAINT "conversation_analytics_conversation_id_key" UNIQUE ("conversation_id");



ALTER TABLE ONLY "public"."conversation_analytics"
    ADD CONSTRAINT "conversation_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_service_id_client_id_provider_id_key" UNIQUE ("service_id", "client_id", "provider_id");



ALTER TABLE ONLY "public"."coupon_usage"
    ADD CONSTRAINT "coupon_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."extra_products"
    ADD CONSTRAINT "extra_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices_dev"
    ADD CONSTRAINT "invoices_dev_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices_dev"
    ADD CONSTRAINT "invoices_dev_stripe_invoice_id_key" UNIQUE ("stripe_invoice_id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_stripe_invoice_id_key" UNIQUE ("stripe_invoice_id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."otp_settings"
    ADD CONSTRAINT "otp_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_logs"
    ADD CONSTRAINT "password_reset_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."phone_verification_codes"
    ADD CONSTRAINT "phone_verification_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles_images"
    ADD CONSTRAINT "profiles_images_duplicate_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_index_key" UNIQUE ("user_index");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_unique_user_action_window" UNIQUE ("user_id", "action_type", "window_start");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."search_analytics"
    ADD CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_analytics"
    ADD CONSTRAINT "service_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_images"
    ADD CONSTRAINT "service_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_media"
    ADD CONSTRAINT "service_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_reviews"
    ADD CONSTRAINT "service_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_events"
    ADD CONSTRAINT "stipe_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_tiers_dev"
    ADD CONSTRAINT "subscription_tiers_dev_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_tiers"
    ADD CONSTRAINT "subscription_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_transactions_dev"
    ADD CONSTRAINT "subscription_transactions_dev_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_transactions_dev"
    ADD CONSTRAINT "subscription_transactions_dev_stripe_invoice_id_key" UNIQUE ("stripe_invoice_id");



ALTER TABLE ONLY "public"."subscription_transactions"
    ADD CONSTRAINT "subscription_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_transactions"
    ADD CONSTRAINT "subscription_transactions_stripe_invoice_id_key" UNIQUE ("stripe_invoice_id");



ALTER TABLE ONLY "public"."subscriptions_dev"
    ADD CONSTRAINT "subscriptions_dev_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions_dev"
    ADD CONSTRAINT "subscriptions_dev_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."table_name"
    ADD CONSTRAINT "table_name_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activity"
    ADD CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_reports"
    ADD CONSTRAINT "user_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."users_with_extra_products"
    ADD CONSTRAINT "users_with_extra_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users_with_extra_products"
    ADD CONSTRAINT "users_with_extra_products_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."web_analytics"
    ADD CONSTRAINT "web_analytics_duplicate_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."web_analytics_dev"
    ADD CONSTRAINT "web_analytics_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_conversation_analytics_service_id" ON "public"."conversation_analytics" USING "btree" ("service_id");



CREATE INDEX "idx_conversations_client_id" ON "public"."conversations" USING "btree" ("client_id");



CREATE INDEX "idx_conversations_last_message_at" ON "public"."conversations" USING "btree" ("last_message_at" DESC);



CREATE INDEX "idx_conversations_provider_id" ON "public"."conversations" USING "btree" ("provider_id");



CREATE INDEX "idx_conversations_service_id" ON "public"."conversations" USING "btree" ("service_id");



CREATE INDEX "idx_messages_conversation_id" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_read_at" ON "public"."messages" USING "btree" ("read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_messages_sender_id" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_search_analytics_created_at" ON "public"."search_analytics" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_search_analytics_query" ON "public"."search_analytics" USING "gin" ("to_tsvector"('"english"'::"regconfig", "search_query"));



CREATE INDEX "idx_service_analytics_action_type" ON "public"."service_analytics" USING "btree" ("action_type");



CREATE INDEX "idx_service_analytics_created_at" ON "public"."service_analytics" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_service_analytics_service_id" ON "public"."service_analytics" USING "btree" ("service_id");



CREATE INDEX "idx_user_activity_created_at" ON "public"."user_activity" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_activity_user_id" ON "public"."user_activity" USING "btree" ("user_id");



CREATE UNIQUE INDEX "unique_private_conversation" ON "public"."conversations" USING "btree" ("client_id", "provider_id") WHERE ("service_id" IS NULL);



CREATE UNIQUE INDEX "unique_service_conversation" ON "public"."conversations" USING "btree" ("client_id", "provider_id", "service_id") WHERE ("service_id" IS NOT NULL);



CREATE OR REPLACE TRIGGER "check_otp_expiry_trigger" BEFORE INSERT OR UPDATE ON "public"."otp_settings" FOR EACH ROW EXECUTE FUNCTION "public"."validate_otp_expiry"();



CREATE OR REPLACE TRIGGER "on_payment_completed" AFTER UPDATE ON "public"."payment_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_payment_completion"();



CREATE OR REPLACE TRIGGER "trigger_update_service_provider_status" AFTER INSERT OR UPDATE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."update_service_provider_status"();



CREATE OR REPLACE TRIGGER "update_contact_submissions_updated_at" BEFORE UPDATE ON "public"."contact_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_contact_submission_updated_at"();



CREATE OR REPLACE TRIGGER "update_conversation_analytics_trigger" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_conversation_analytics"();



CREATE OR REPLACE TRIGGER "update_conversation_last_message_trigger" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_conversation_last_message"();



ALTER TABLE ONLY "public"."analytics_page_views"
    ADD CONSTRAINT "analytics_page_views_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."analytics_sessions"("id");



ALTER TABLE ONLY "public"."conversation_analytics"
    ADD CONSTRAINT "conversation_analytics_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_analytics"
    ADD CONSTRAINT "conversation_analytics_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coupon_usage"
    ADD CONSTRAINT "coupon_usage_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id");



ALTER TABLE ONLY "public"."coupon_usage"
    ADD CONSTRAINT "coupon_usage_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transactions"("id");



ALTER TABLE ONLY "public"."coupon_usage"
    ADD CONSTRAINT "coupon_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "fk_services_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices_dev"
    ADD CONSTRAINT "invoices_dev_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions_dev"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices_dev"
    ADD CONSTRAINT "invoices_dev_subscription_transaction_id_fkey" FOREIGN KEY ("subscription_transaction_id") REFERENCES "public"."subscription_transactions_dev"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices_dev"
    ADD CONSTRAINT "invoices_dev_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_subscription_transaction_id_fkey" FOREIGN KEY ("subscription_transaction_id") REFERENCES "public"."subscription_transactions"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey1" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."otp_settings"
    ADD CONSTRAINT "otp_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles_images"
    ADD CONSTRAINT "profiles_images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."search_analytics"
    ADD CONSTRAINT "search_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_analytics"
    ADD CONSTRAINT "service_analytics_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_analytics"
    ADD CONSTRAINT "service_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_images"
    ADD CONSTRAINT "service_images_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_media"
    ADD CONSTRAINT "service_media_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_reviews"
    ADD CONSTRAINT "service_reviews_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_reviews"
    ADD CONSTRAINT "service_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_transactions"
    ADD CONSTRAINT "subscription_transactions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscription_transactions_dev"
    ADD CONSTRAINT "subscription_transactions_dev_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscription_transactions_dev"
    ADD CONSTRAINT "subscription_transactions_dev_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices_dev"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscription_transactions_dev"
    ADD CONSTRAINT "subscription_transactions_dev_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions_dev"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscription_transactions_dev"
    ADD CONSTRAINT "subscription_transactions_dev_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscription_transactions"
    ADD CONSTRAINT "subscription_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_transactions"
    ADD CONSTRAINT "subscription_transactions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscription_transactions"
    ADD CONSTRAINT "subscription_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subscriptions_dev"
    ADD CONSTRAINT "subscriptions_dev_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "public"."subscription_tiers"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions_dev"
    ADD CONSTRAINT "subscriptions_dev_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "public"."subscription_tiers"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity"
    ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_reports"
    ADD CONSTRAINT "user_reports_reported_id_fkey" FOREIGN KEY ("reported_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_reports"
    ADD CONSTRAINT "user_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_with_extra_products"
    ADD CONSTRAINT "users_with_extra_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."extra_products"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users_with_extra_products"
    ADD CONSTRAINT "users_with_extra_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



CREATE POLICY "ALLOW EVERYONE TO VIEW TIERS" ON "public"."subscription_tiers_dev" FOR SELECT USING (true);



CREATE POLICY "Admins can create services and assign users to them as publishe" ON "public"."services" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can delete user reports" ON "public"."user_reports" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert profiles" ON "public"."profiles" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage user roles" ON "public"."user_roles" TO "service_role" USING ((("user_id" = "auth"."uid"()) AND ("role" = 'admin'::"public"."app_role")));



CREATE POLICY "Admins can update all profiles" ON "public"."profiles" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update all services" ON "public"."services" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all audit logs" ON "public"."admin_audit_log" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all conversation analytics" ON "public"."conversation_analytics" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all published services" ON "public"."services" FOR SELECT USING ((("status" = 'published'::"text") AND "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Admins can view all search analytics" ON "public"."search_analytics" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all service analytics" ON "public"."service_analytics" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all services" ON "public"."services" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all user activity" ON "public"."user_activity" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all user roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Admins can view user reports" ON "public"."user_reports" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins or publishers can delete service images" ON "public"."service_images" FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."services" "s"
  WHERE (("s"."id" = "service_images"."service_id") AND ("s"."user_id" = "auth"."uid"())))) OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Anyone can check contact rate limits" ON "public"."contact_rate_limits" USING (true);



CREATE POLICY "Anyone can create contact submissions" ON "public"."contact_submissions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can submit contact forms" ON "public"."contact_submissions" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anyone can view active coupons" ON "public"."coupons" FOR SELECT USING (("active" = true));



CREATE POLICY "Anyone can view images of published services" ON "public"."service_images" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."services"
  WHERE (("services"."id" = "service_images"."service_id") AND ("services"."status" = 'published'::"text")))));



CREATE POLICY "Authenticated Instance can manage data" ON "public"."subscription_transactions" TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Conversations can be deleted if they are empty" ON "public"."conversations" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "EVENTS ONLY INERTED BY SERVER" ON "public"."stripe_events" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."service_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."services"
  WHERE (("services"."id" = "service_media"."service_id") AND ("services"."status" = 'published'::"text")))));



CREATE POLICY "ONLY ADMINS can manage coupons" ON "public"."coupons" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "ONLY ADMINS can modify the table" ON "public"."subscription_tiers" TO "supabase_admin" USING (true) WITH CHECK (true);



CREATE POLICY "ONLY ADMINS can view data" ON "public"."web_analytics_dev" FOR SELECT TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "ONLY ADMINS can view the data" ON "public"."web_analytics" FOR SELECT TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Only Admins can manage the data" ON "public"."phone_verification_codes" TO "supabase_auth_admin", "supabase_admin", "service_role", "supabase_functions_admin" USING (true);



CREATE POLICY "Only admins can delete contact submissions" ON "public"."contact_submissions" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update contact submissions" ON "public"."contact_submissions" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view contact submissions" ON "public"."contact_submissions" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only service publisher can delete media" ON "public"."service_media" FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."services" "s"
  WHERE (("s"."id" = "service_media"."service_id") AND ("s"."user_id" = "auth"."uid"())))) OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Public can view basic service info" ON "public"."services" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Restrict all access to table_name" ON "public"."table_name" USING (false);



CREATE POLICY "Service owners can view their own services" ON "public"."services" FOR SELECT USING ((("auth"."uid"() = "user_id") AND ("status" = 'published'::"text")));



CREATE POLICY "Service role can delete users profiles on request" ON "public"."profiles" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Subscribers can view contact info" ON "public"."services" FOR SELECT USING ((("status" = 'published'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."subscriptions"
  WHERE (("subscriptions"."user_id" = "auth"."uid"()) AND ("subscriptions"."status" = 'active'::"text") AND ("subscriptions"."expires_at" > "now"()))))));



CREATE POLICY "Users can create conversations" ON "public"."conversations" FOR INSERT WITH CHECK (("auth"."uid"() = "client_id"));



CREATE POLICY "Users can create images for their own services" ON "public"."service_images" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."services"
  WHERE (("services"."id" = "service_images"."service_id") AND (("services"."user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."user_roles" "ur"
          WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."app_role")))))))));



CREATE POLICY "Users can create messages in their conversations" ON "public"."messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."client_id" = "auth"."uid"()) OR ("conversations"."provider_id" = "auth"."uid"())))))));



CREATE POLICY "Users can create own transactions" ON "public"."payment_transactions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create service reviews" ON "public"."service_reviews" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can create their own coupon usage" ON "public"."coupon_usage" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own services" ON "public"."services" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own subscriptions" ON "public"."subscriptions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own services" ON "public"."services" FOR DELETE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."app_role"))))));



CREATE POLICY "Users can delete their profile" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert conversation analytics" ON "public"."conversation_analytics" FOR INSERT WITH CHECK ((("auth"."uid"() = "client_id") OR ("auth"."uid"() = "provider_id")));



CREATE POLICY "Users can insert search analytics" ON "public"."search_analytics" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert service analytics" ON "public"."service_analytics" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert their own activity" ON "public"."user_activity" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage their own rate limits" ON "public"."rate_limits" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can mark messages as read in their conversations" ON "public"."messages" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."client_id" = "auth"."uid"()) OR ("conversations"."provider_id" = "auth"."uid"())))))) WITH CHECK (("auth"."uid"() <> "sender_id"));



CREATE POLICY "Users can remove reviews" ON "public"."service_reviews" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can report other user (i.e. create a new row)" ON "public"."user_reports" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can update the views count of services" ON "public"."services" FOR UPDATE TO "authenticated" USING (true) WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ((("user_id" <> "auth"."uid"()) AND ("views" IS NOT NULL)) OR ("user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own conversations" ON "public"."conversations" FOR UPDATE USING ((("auth"."uid"() = "client_id") OR ("auth"."uid"() = "provider_id")));



CREATE POLICY "Users can update their own messages" ON "public"."messages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."client_id" = "auth"."uid"()) OR ("conversations"."provider_id" = "auth"."uid"()))))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own services" ON "public"."services" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."app_role"))))));



CREATE POLICY "Users can update their reviews" ON "public"."service_reviews" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their subscriptions" ON "public"."subscriptions" FOR UPDATE TO "authenticated", "supabase_admin" USING (true) WITH CHECK (true);



CREATE POLICY "Users can view messages in their conversations" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."client_id" = "auth"."uid"()) OR ("conversations"."provider_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view own transactions" ON "public"."payment_transactions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view service reviews" ON "public"."service_reviews" FOR SELECT USING (true);



CREATE POLICY "Users can view service's number of views" ON "public"."service_analytics" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view the subscriptions" ON "public"."subscription_tiers" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can view their own conversations" ON "public"."conversations" FOR SELECT USING ((("auth"."uid"() = "client_id") OR ("auth"."uid"() = "provider_id")));



CREATE POLICY "Users can view their own coupon usage" ON "public"."coupon_usage" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own invoices only" ON "public"."invoices" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own services" ON "public"."services" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own subscriptions" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their service images" ON "public"."service_images" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."services" "s"
  WHERE (("s"."id" = "service_images"."service_id") AND ("s"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users to insert media" ON "public"."service_media" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."services"
  WHERE (("services"."id" = "service_media"."service_id") AND (("services"."user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."user_roles" "ur"
          WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."app_role")))))))));



CREATE POLICY "Users with the admin role can delete other users profile" ON "public"."profiles" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"public"."app_role"))))));



ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_page_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anyone can insert data" ON "public"."web_analytics" FOR INSERT WITH CHECK (true);



CREATE POLICY "anyone can insert data into the web analytics table" ON "public"."web_analytics_dev" FOR INSERT WITH CHECK (true);



CREATE POLICY "anyone can manage data" ON "public"."analytics_page_views" USING (true) WITH CHECK (true);



CREATE POLICY "anyone can manage data" ON "public"."analytics_sessions" USING (true) WITH CHECK (true);



CREATE POLICY "anyone can view data" ON "public"."extra_products" FOR SELECT USING (true);



CREATE POLICY "anyone can view profiles" ON "public"."profiles" FOR SELECT USING (true);



ALTER TABLE "public"."contact_rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coupon_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_policy" ON "public"."otp_settings" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."extra_products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_policy" ON "public"."otp_settings" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices_dev" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "only service role can manage this table" ON "public"."password_reset_logs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "only service roles can manage data" ON "public"."users_with_extra_products" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."otp_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."password_reset_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."phone_verification_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."search_analytics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_policy" ON "public"."otp_settings" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "service roles can view data" ON "public"."web_analytics_dev" FOR SELECT TO "service_role" USING (true);



ALTER TABLE "public"."service_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_tiers_dev" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_transactions_dev" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions_dev" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."table_name" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_policy" ON "public"."otp_settings" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."user_activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can manage data" ON "public"."subscription_transactions_dev" TO "authenticated" USING (true);



CREATE POLICY "users can manage their media" ON "public"."service_media" TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."services" "s"
  WHERE (("s"."id" = "service_media"."service_id") AND ("s"."user_id" = "auth"."uid"())))) OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "users can view data" ON "public"."users_with_extra_products" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "users can view their subs and update them" ON "public"."subscriptions_dev" TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."users_with_extra_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."web_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."web_analytics_dev" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."check_contact_rate_limit"("_ip_address" "inet") TO "anon";
GRANT ALL ON FUNCTION "public"."check_contact_rate_limit"("_ip_address" "inet") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_contact_rate_limit"("_ip_address" "inet") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rate_limit"("_user_id" "uuid", "_ip_address" "inet", "_action_type" "text", "_max_attempts" integer, "_window_minutes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("_user_id" "uuid", "_ip_address" "inet", "_action_type" "text", "_max_attempts" integer, "_window_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("_user_id" "uuid", "_ip_address" "inet", "_action_type" "text", "_max_attempts" integer, "_window_minutes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."daily_login_activity"("days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."daily_login_activity"("days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."daily_login_activity"("days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_analytics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_analytics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_analytics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_conversation_details"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_conversation_details"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_conversation_details"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_subscription_data_with_stripe"("tier_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_subscription_data_with_stripe"("tier_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_subscription_data_with_stripe"("tier_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_search_terms"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_search_terms"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_search_terms"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_payment_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_payment_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_payment_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_admin_action"("_action_type" "text", "_table_name" "text", "_record_id" "uuid", "_old_values" "jsonb", "_new_values" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_admin_action"("_action_type" "text", "_table_name" "text", "_record_id" "uuid", "_old_values" "jsonb", "_new_values" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_admin_action"("_action_type" "text", "_table_name" "text", "_record_id" "uuid", "_old_values" "jsonb", "_new_values" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."login_activity_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."login_activity_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."login_activity_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_message_as_read"("message_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."monthly_login_activity"("months_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."monthly_login_activity"("months_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."monthly_login_activity"("months_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_contact_submission_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_contact_submission_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_contact_submission_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversation_analytics"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_analytics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_analytics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_service_provider_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_service_provider_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_service_provider_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_admin_input"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_admin_input"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_admin_input"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_coupon"("coupon_code" "text", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_coupon"("coupon_code" "text", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_coupon"("coupon_code" "text", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_otp_expiry"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_otp_expiry"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_otp_expiry"() TO "service_role";



GRANT ALL ON FUNCTION "public"."yearly_login_activity"("years_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."yearly_login_activity"("years_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."yearly_login_activity"("years_back" integer) TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_page_views" TO "anon";
GRANT ALL ON TABLE "public"."analytics_page_views" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_page_views" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_sessions" TO "anon";
GRANT ALL ON TABLE "public"."analytics_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."contact_rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."contact_rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."contact_submissions" TO "anon";
GRANT ALL ON TABLE "public"."contact_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_analytics" TO "anon";
GRANT ALL ON TABLE "public"."conversation_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."coupon_usage" TO "anon";
GRANT ALL ON TABLE "public"."coupon_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."coupon_usage" TO "service_role";



GRANT ALL ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON TABLE "public"."extra_products" TO "anon";
GRANT ALL ON TABLE "public"."extra_products" TO "authenticated";
GRANT ALL ON TABLE "public"."extra_products" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."invoices_dev" TO "anon";
GRANT ALL ON TABLE "public"."invoices_dev" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices_dev" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoices_dev_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoices_dev_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoices_dev_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."otp_settings" TO "anon";
GRANT ALL ON TABLE "public"."otp_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."otp_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."otp_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."otp_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."otp_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."password_reset_logs" TO "anon";
GRANT ALL ON TABLE "public"."password_reset_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."password_reset_logs" TO "service_role";



GRANT ALL ON TABLE "public"."payment_transactions" TO "anon";
GRANT ALL ON TABLE "public"."payment_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."phone_verification_codes" TO "anon";
GRANT ALL ON TABLE "public"."phone_verification_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."phone_verification_codes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."phone_verification_codes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."phone_verification_codes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."phone_verification_codes_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profiles_user_index_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_user_index_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_user_index_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."profiles_images" TO "anon";
GRANT ALL ON TABLE "public"."profiles_images" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles_images" TO "service_role";



GRANT ALL ON TABLE "public"."profiles_with_email" TO "anon";
GRANT ALL ON TABLE "public"."profiles_with_email" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles_with_email" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."public_services" TO "anon";
GRANT ALL ON TABLE "public"."public_services" TO "authenticated";
GRANT ALL ON TABLE "public"."public_services" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."search_analytics" TO "anon";
GRANT ALL ON TABLE "public"."search_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."search_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."service_analytics" TO "anon";
GRANT ALL ON TABLE "public"."service_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."service_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."service_images" TO "anon";
GRANT ALL ON TABLE "public"."service_images" TO "authenticated";
GRANT ALL ON TABLE "public"."service_images" TO "service_role";



GRANT ALL ON TABLE "public"."service_media" TO "anon";
GRANT ALL ON TABLE "public"."service_media" TO "authenticated";
GRANT ALL ON TABLE "public"."service_media" TO "service_role";



GRANT ALL ON TABLE "public"."service_reviews" TO "anon";
GRANT ALL ON TABLE "public"."service_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."service_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_events" TO "anon";
GRANT ALL ON TABLE "public"."stripe_events" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."stipe_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."stipe_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."stipe_events_id_seq" TO "service_role";



-- GRANT ALL ON TABLE "public"."stripe_checkout_sessions" TO "anon";
-- GRANT ALL ON TABLE "public"."stripe_checkout_sessions" TO "authenticated";
-- GRANT ALL ON TABLE "public"."stripe_checkout_sessions" TO "service_role";



-- GRANT ALL ON TABLE "public"."stripe_customer_data" TO "anon";
-- GRANT ALL ON TABLE "public"."stripe_customer_data" TO "authenticated";
-- GRANT ALL ON TABLE "public"."stripe_customer_data" TO "service_role";



-- GRANT ALL ON TABLE "public"."stripe_invoices" TO "anon";
-- GRANT ALL ON TABLE "public"."stripe_invoices" TO "authenticated";
-- GRANT ALL ON TABLE "public"."stripe_invoices" TO "service_role";



-- GRANT ALL ON TABLE "public"."stripe_prices" TO "anon";
-- GRANT ALL ON TABLE "public"."stripe_prices" TO "authenticated";
-- GRANT ALL ON TABLE "public"."stripe_prices" TO "service_role";



-- GRANT ALL ON TABLE "public"."stripe_products" TO "anon";
-- GRANT ALL ON TABLE "public"."stripe_products" TO "authenticated";
-- GRANT ALL ON TABLE "public"."stripe_products" TO "service_role";



-- GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "anon";
-- GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "authenticated";
-- GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_tiers" TO "anon";
GRANT ALL ON TABLE "public"."subscription_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_tiers_dev" TO "anon";
GRANT ALL ON TABLE "public"."subscription_tiers_dev" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_tiers_dev" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_transactions" TO "anon";
GRANT ALL ON TABLE "public"."subscription_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_transactions_dev" TO "anon";
GRANT ALL ON TABLE "public"."subscription_transactions_dev" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_transactions_dev" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions_dev" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions_dev" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions_dev" TO "service_role";



GRANT ALL ON TABLE "public"."table_name" TO "anon";
GRANT ALL ON TABLE "public"."table_name" TO "authenticated";
GRANT ALL ON TABLE "public"."table_name" TO "service_role";



GRANT ALL ON SEQUENCE "public"."table_name_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."table_name_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."table_name_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity" TO "anon";
GRANT ALL ON TABLE "public"."user_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity" TO "service_role";



GRANT ALL ON TABLE "public"."user_reports" TO "anon";
GRANT ALL ON TABLE "public"."user_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."user_reports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users_with_extra_products" TO "anon";
GRANT ALL ON TABLE "public"."users_with_extra_products" TO "authenticated";
GRANT ALL ON TABLE "public"."users_with_extra_products" TO "service_role";



GRANT ALL ON TABLE "public"."web_analytics" TO "anon";
GRANT ALL ON TABLE "public"."web_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."web_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."web_analytics_dev" TO "anon";
GRANT ALL ON TABLE "public"."web_analytics_dev" TO "authenticated";
GRANT ALL ON TABLE "public"."web_analytics_dev" TO "service_role";



GRANT ALL ON SEQUENCE "public"."web_analytics_duplicate_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."web_analytics_duplicate_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."web_analytics_duplicate_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."web_analytics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."web_analytics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."web_analytics_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






