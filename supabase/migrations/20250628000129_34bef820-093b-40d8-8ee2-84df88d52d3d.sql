
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own services" ON public.services;
DROP POLICY IF EXISTS "Users can create their own services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;
DROP POLICY IF EXISTS "Anyone can view published services" ON public.services;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view images of their own services" ON public.service_images;
DROP POLICY IF EXISTS "Users can create images for their own services" ON public.service_images;
DROP POLICY IF EXISTS "Anyone can view images of published services" ON public.service_images;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for services table
CREATE POLICY "Users can view their own services" ON public.services
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own services" ON public.services
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" ON public.services
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" ON public.services
  FOR DELETE USING (auth.uid() = user_id);

-- Public can view published services
CREATE POLICY "Anyone can view published services" ON public.services
  FOR SELECT USING (status = 'published');

-- Create RLS policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for service_images table
CREATE POLICY "Users can view images of their own services" ON public.service_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = service_images.service_id 
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create images for their own services" ON public.service_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = service_images.service_id 
      AND services.user_id = auth.uid()
    )
  );

-- Public can view images of published services
CREATE POLICY "Anyone can view images of published services" ON public.service_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = service_images.service_id 
      AND services.status = 'published'
    )
  );
