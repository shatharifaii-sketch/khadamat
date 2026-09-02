
-- Sync service views from analytics data
UPDATE services 
SET views = COALESCE(analytics_views.view_count, 0)
FROM (
  SELECT 
    service_id,
    COUNT(*) as view_count
  FROM service_analytics 
  WHERE action_type = 'view'
  GROUP BY service_id
) analytics_views
WHERE services.id = analytics_views.service_id;

-- Update users with published services to be service providers
UPDATE profiles 
SET is_service_provider = true
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM services 
  WHERE status = 'published'
);

-- Create function to automatically update service provider status
CREATE OR REPLACE FUNCTION update_service_provider_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If a service is being published, mark user as service provider
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    UPDATE profiles 
    SET is_service_provider = true 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update service provider status
DROP TRIGGER IF EXISTS trigger_update_service_provider_status ON services;
CREATE TRIGGER trigger_update_service_provider_status
  AFTER INSERT OR UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_service_provider_status();
