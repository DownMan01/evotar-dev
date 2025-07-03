-- Create a function to safely get users for admin dashboard
CREATE OR REPLACE FUNCTION get_users_for_admin(user_limit integer)
RETURNS SETOF users AS $$
BEGIN
  -- This function bypasses RLS policies
  RETURN QUERY
  SELECT * FROM users
  ORDER BY created_at DESC
  LIMIT user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
