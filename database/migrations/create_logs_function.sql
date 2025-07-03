-- Create a function to create the system_logs table if it doesn't exist
CREATE OR REPLACE FUNCTION create_system_logs_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'system_logs'
  ) THEN
    -- Create the table
    CREATE TABLE public.system_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      action TEXT NOT NULL,
      description TEXT,
      user_id UUID REFERENCES public.users(id),
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB
    );

    -- Add index for faster queries
    CREATE INDEX system_logs_timestamp_idx ON public.system_logs(timestamp DESC);
    CREATE INDEX system_logs_user_id_idx ON public.system_logs(user_id);

    -- Add RLS policies
    ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

    -- Allow anyone to select from system_logs (we'll rely on application-level security)
    CREATE POLICY "Allow anyone to view logs" 
      ON public.system_logs 
      FOR SELECT 
      USING (true);

    -- System can insert logs
    CREATE POLICY "Allow system to insert logs" 
      ON public.system_logs 
      FOR INSERT 
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_system_logs_table_if_not_exists TO authenticated;
