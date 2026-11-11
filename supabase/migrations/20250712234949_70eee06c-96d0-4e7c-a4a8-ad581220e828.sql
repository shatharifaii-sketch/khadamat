-- Create analytics tables for tracking user behavior and service performance

-- Table for tracking search queries
CREATE TABLE public.search_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    category TEXT,
    location TEXT,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT
);

-- Table for tracking service clicks and views
CREATE TABLE public.service_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'view', 'contact_click', 'phone_click', 'email_click'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- Table for tracking conversation analytics
CREATE TABLE public.conversation_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    client_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    message_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active'
);

-- Table for user activity tracking
CREATE TABLE public.user_activity (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'login', 'service_posted', 'service_viewed', 'message_sent', etc.
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS on all analytics tables
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies for analytics tables
CREATE POLICY "Admins can view all search analytics" 
ON public.search_analytics 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (
            -- Add admin email check (adjust as needed)
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = profiles.id 
                AND email IN ('admin@example.com', 'admin@yourdomain.com')
            )
        )
    )
);

CREATE POLICY "Admins can view all service analytics" 
ON public.service_analytics 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = profiles.id 
                AND email IN ('admin@example.com', 'admin@yourdomain.com')
            )
        )
    )
);

CREATE POLICY "Admins can view all conversation analytics" 
ON public.conversation_analytics 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = profiles.id 
                AND email IN ('admin@example.com', 'admin@yourdomain.com')
            )
        )
    )
);

CREATE POLICY "Admins can view all user activity" 
ON public.user_activity 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = profiles.id 
                AND email IN ('admin@example.com', 'admin@yourdomain.com')
            )
        )
    )
);

-- Allow authenticated users to insert their own analytics data
CREATE POLICY "Users can insert search analytics" 
ON public.search_analytics 
FOR INSERT 
WITH CHECK (true); -- Allow anonymous search tracking

CREATE POLICY "Users can insert service analytics" 
ON public.service_analytics 
FOR INSERT 
WITH CHECK (true); -- Allow anonymous view tracking

CREATE POLICY "Users can insert conversation analytics" 
ON public.conversation_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "Users can insert their own activity" 
ON public.user_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at DESC);
CREATE INDEX idx_search_analytics_query ON public.search_analytics USING gin(to_tsvector('english', search_query));
CREATE INDEX idx_service_analytics_service_id ON public.service_analytics(service_id);
CREATE INDEX idx_service_analytics_created_at ON public.service_analytics(created_at DESC);
CREATE INDEX idx_service_analytics_action_type ON public.service_analytics(action_type);
CREATE INDEX idx_conversation_analytics_service_id ON public.conversation_analytics(service_id);
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);

-- Create function to update conversation analytics
CREATE OR REPLACE FUNCTION public.update_conversation_analytics()
RETURNS TRIGGER AS $$
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
        (SELECT service_id FROM conversations WHERE id = NEW.conversation_id),
        (SELECT client_id FROM conversations WHERE id = NEW.conversation_id),
        (SELECT provider_id FROM conversations WHERE id = NEW.conversation_id),
        1,
        NEW.created_at
    )
    ON CONFLICT (conversation_id) 
    DO UPDATE SET 
        message_count = conversation_analytics.message_count + 1,
        last_activity_at = NEW.created_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation analytics when messages are sent
CREATE TRIGGER update_conversation_analytics_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_analytics();