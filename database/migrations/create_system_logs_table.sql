-- Create system_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES public.users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS system_logs_timestamp_idx ON public.system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS system_logs_user_id_idx ON public.system_logs(user_id);

-- Add RLS policies
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Allow admins to view logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- System can insert logs
CREATE POLICY "Allow system to insert logs" 
  ON public.system_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Add some initial log entries
INSERT INTO public.system_logs (action, description, timestamp)
VALUES 
  ('System Initialization', 'System logs table created and initialized', NOW()),
  ('Database Setup', 'Database schema initialized with required tables', NOW() - INTERVAL '5 minutes'),
  ('Security Check', 'Routine security audit completed successfully', NOW() - INTERVAL '1 hour'),
  ('Backup Completed', 'Automated system backup completed successfully', NOW() - INTERVAL '12 hours'),
  ('System Update', 'System updated to latest version', NOW() - INTERVAL '1 day');
