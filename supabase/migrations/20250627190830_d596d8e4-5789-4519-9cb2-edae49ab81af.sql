
-- Create services table to store user services
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price_range TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  experience TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services table
CREATE POLICY "Users can view their own services"
  ON public.services
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own services"
  ON public.services
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
  ON public.services
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
  ON public.services
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view published services
CREATE POLICY "Anyone can view published services"
  ON public.services
  FOR SELECT
  USING (status = 'published');

-- Create subscriptions table to track user subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'service_provider',
  status TEXT NOT NULL DEFAULT 'active',
  amount DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  currency TEXT NOT NULL DEFAULT 'ILS',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create service_images table for portfolio images
CREATE TABLE public.service_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;

-- Create policies for service_images table
CREATE POLICY "Users can view images of their own services"
  ON public.service_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = service_images.service_id 
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create images for their own services"
  ON public.service_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE services.id = service_images.service_id 
      AND services.user_id = auth.uid()
    )
  );

-- Update profiles table to include more user information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_service_provider BOOLEAN DEFAULT false;
