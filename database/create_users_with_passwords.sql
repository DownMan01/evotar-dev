-- Script to create users with proper bcrypt password hashes
-- Default password for all users: "password123"

-- First, let's create a function to generate bcrypt hashes
-- Note: This requires the pgcrypto extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clear existing users first
DELETE FROM public.users;

-- Insert users with proper bcrypt hashes
-- Password: "password123" for all users
INSERT INTO public.users (id, student_id, name, email, password_hash, role, department_id, year_level) VALUES 
  (
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a', 
    'ADMIN001', 
    'System Administrator', 
    'admin@university.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'admin', 
    NULL, 
    NULL
  ),
  (
    'a2b5a2a0-5a2a-4c2a-8c2a-2a2a2a2a2a2a', 
    'STAFF001', 
    'Staff Member', 
    'staff@university.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'staff', 
    NULL, 
    NULL
  ),
  (
    'u1b5a1u0-5u1a-4c1a-8c1a-1u1a1u1a1u1a', 
    'CS-2021-001', 
    'John Doe', 
    'john.doe@student.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'voter', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    '3rd Year'
  ),
  (
    'u2b5a2u0-5u2a-4c2a-8c2a-2u2a2u2a2u2a', 
    'CS-2021-002', 
    'Jane Smith', 
    'jane.smith@student.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'voter', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    '3rd Year'
  ),
  (
    'u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', 
    'ENG-2020-001', 
    'Bob Johnson', 
    'bob.johnson@student.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'voter', 
    'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 
    '4th Year'
  ),
  (
    'u4b5a4u0-5u4a-4c4a-8c4a-4u4a4u4a4u4a', 
    'BUS-2022-001', 
    'Alice Brown', 
    'alice.brown@student.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'voter', 
    'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', 
    '2nd Year'
  ),
  (
    'u5b5a5u0-5u5a-4c5a-8c5a-5u5a5u5a5u5a', 
    'CS-2021-003', 
    'Charlie Wilson', 
    'charlie.wilson@student.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'voter', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    '3rd Year'
  ),
  (
    'u6b5a6u0-5u6a-4c6a-8c6a-6u6a6u6a6u6a', 
    'ENG-2021-002', 
    'Diana Davis', 
    'diana.davis@student.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'voter', 
    'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 
    '3rd Year'
  ),
  (
    'u7b5a7u0-5u7a-4c7a-8c7a-7u7a7u7a7u7a', 
    'BUS-2020-002', 
    'Eva Martinez', 
    'eva.martinez@student.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'voter', 
    'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', 
    '4th Year'
  ),
  (
    'u8b5a8u0-5u8a-4c8a-8c8a-8u8a8u8a8u8a', 
    'LA-2022-001', 
    'Frank Garcia', 
    'frank.garcia@student.edu', 
    crypt('password123', gen_salt('bf', 10)), 
    'voter', 
    'd4b5a4d0-5d4a-4c4a-8c4a-4d4a4d4a4d4a', 
    '2nd Year'
  );

-- Verify the users were created with password hashes
SELECT 
  student_id, 
  name, 
  email, 
  role,
  CASE 
    WHEN password_hash IS NOT NULL AND length(password_hash) > 10 THEN 'Password Set ✓'
    ELSE 'No Password ✗'
  END as password_status
FROM public.users 
ORDER BY role, student_id;

-- Test password verification function
CREATE OR REPLACE FUNCTION test_password_verification()
RETURNS TABLE(
  student_id TEXT,
  name TEXT,
  password_correct BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.student_id,
    u.name,
    (u.password_hash = crypt('password123', u.password_hash)) as password_correct
  FROM public.users u
  ORDER BY u.role, u.student_id;
END;
$$ LANGUAGE plpgsql;

-- Run the test
SELECT * FROM test_password_verification();
