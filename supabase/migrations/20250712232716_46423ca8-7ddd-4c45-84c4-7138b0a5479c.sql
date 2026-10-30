-- Enable realtime for services table
ALTER TABLE public.services REPLICA IDENTITY FULL;

-- Add services table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;