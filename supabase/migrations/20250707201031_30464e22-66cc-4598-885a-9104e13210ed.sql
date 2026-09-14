
-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true);

-- Create RLS policies for the service-images bucket
CREATE POLICY "Allow authenticated users to upload service images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "Allow users to update their own service images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own service images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
