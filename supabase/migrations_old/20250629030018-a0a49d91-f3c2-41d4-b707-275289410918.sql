
-- Enable Row Level Security on the remaining table
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Create a basic RLS policy for the table_name table
-- Since this appears to be a generic/unused table, we'll restrict all access
CREATE POLICY "Restrict all access to table_name" ON public.table_name
  FOR ALL USING (false);
