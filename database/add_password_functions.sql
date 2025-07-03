-- Add password verification functions to the database

-- Function to verify user password
CREATE OR REPLACE FUNCTION verify_user_password(p_user_id UUID, p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Get the stored password hash
  SELECT password_hash INTO stored_hash
  FROM public.users
  WHERE id = p_user_id;
  
  -- If no user found, return false
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verify the password using crypt
  RETURN (stored_hash = crypt(p_password, stored_hash));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the find_user_by_student_id function to include password_hash
CREATE OR REPLACE FUNCTION find_user_by_student_id(p_student_id TEXT)
RETURNS SETOF public.users AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.users
  WHERE 
    student_id = p_student_id OR
    student_id = REPLACE(p_student_id, '-', '') OR
    REPLACE(student_id, '-', '') = REPLACE(p_student_id, '-', '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_user_password(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION find_user_by_student_id(TEXT) TO anon, authenticated;
