
-- Add payment tracking columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS services_allowed INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS services_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'credit_card',
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;

-- Create payment_transactions table to track individual payments
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC NOT NULL DEFAULT 10.00,
  currency TEXT NOT NULL DEFAULT 'ILS',
  payment_method TEXT NOT NULL, -- 'credit_card', 'reflect', 'jawwal_pay', 'ooredoo', 'bank_transfer'
  transaction_id TEXT, -- External transaction reference
  services_quota INTEGER NOT NULL DEFAULT 2, -- Number of services this payment allows
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  payment_data JSONB, -- Store gateway-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can create own transactions" ON payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update services_allowed when payment is completed
CREATE OR REPLACE FUNCTION handle_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update user's subscription to add the services quota
    INSERT INTO subscriptions (user_id, services_allowed, services_used, amount, payment_method, status)
    VALUES (NEW.user_id, NEW.services_quota, 0, NEW.amount, NEW.payment_method, 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      services_allowed = subscriptions.services_allowed + NEW.services_quota,
      amount = subscriptions.amount + NEW.amount,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payment completion
CREATE TRIGGER on_payment_completed
  AFTER UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_completion();
