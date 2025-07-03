-- Create a function to execute SQL directly (with admin privileges)
CREATE OR REPLACE FUNCTION exec_sql(sql text) 
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

-- Create a function to get system logs with pagination
CREATE OR REPLACE FUNCTION get_system_logs(page_number int, page_size int)
RETURNS SETOF system_logs AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM system_logs
  ORDER BY timestamp DESC
  LIMIT page_size
  OFFSET ((page_number - 1) * page_size);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to count system logs
CREATE OR REPLACE FUNCTION get_system_logs_count()
RETURNS bigint AS $$
DECLARE
  log_count bigint;
BEGIN
  SELECT COUNT(*) INTO log_count FROM system_logs;
  RETURN log_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_system_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_logs_count TO authenticated;
