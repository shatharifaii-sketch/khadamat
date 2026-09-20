-- Add subscription tier and plan type columns to payment_transactions and subscriptions tables
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS discount_applied NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_amount NUMERIC DEFAULT 0;

-- Update subscriptions table to handle yearly subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS auto_bump_service BOOLEAN DEFAULT false;

-- Update the payment completion function to handle yearly subscriptions
CREATE OR REPLACE FUNCTION handle_payment_completion()
RETURNS TRIGGER AS $$
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
      INSERT INTO subscriptions (
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
          ELSE subscriptions.services_allowed + 1
        END,
        amount = subscriptions.amount + NEW.amount,
        expires_at = expires_date,
        subscription_tier = NEW.subscription_tier,
        auto_bump_service = CASE WHEN NEW.subscription_tier = 'yearly' THEN true ELSE false END,
        updated_at = NOW();
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;