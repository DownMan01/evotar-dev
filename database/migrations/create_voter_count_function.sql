-- Create a function to safely get voter count without triggering RLS
CREATE OR REPLACE FUNCTION get_voter_count()
RETURNS integer AS $$
DECLARE
  voter_count integer;
BEGIN
  SELECT COUNT(*) INTO voter_count FROM users WHERE role = 'voter';
  RETURN voter_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_voter_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_voter_count TO anon;
