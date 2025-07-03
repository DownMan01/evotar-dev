-- Create a function to safely get users for admin dashboard
-- This function bypasses RLS policies with SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_users_safe(user_limit integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  student_id text,
  role text,
  department_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.student_id, u.role, u.department_id
  FROM users u
  ORDER BY u.created_at DESC
  LIMIT user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users_safe TO authenticated;
