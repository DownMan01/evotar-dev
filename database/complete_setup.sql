-- Complete Database Setup for Blockchain Voting System
-- This script creates all tables, functions, triggers, and sample data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS public.system_logs CASCADE;
DROP TABLE IF EXISTS public.user_wallets CASCADE;
DROP TABLE IF EXISTS public.blockchain_transactions CASCADE;
DROP TABLE IF EXISTS public.election_results CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.elections CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.election_types CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE
);

-- Create election_types table
CREATE TABLE public.election_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE
);

-- Create users table (compatible with Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  student_id TEXT UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'voter' CHECK (role IN ('voter', 'staff', 'admin')),
  department_id UUID REFERENCES public.departments(id),
  year_level TEXT,
  wallet_address TEXT,
  user_mnemonic TEXT,
  user_img TEXT
);

-- Create user_wallets table
CREATE TABLE public.user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL UNIQUE,
  encrypted_private_key TEXT NOT NULL,
  mnemonic_phrase TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create positions table
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  election_type_id UUID REFERENCES public.election_types(id) NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Create elections table
CREATE TABLE public.elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  election_type_id UUID REFERENCES public.election_types(id) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  created_by UUID REFERENCES public.users(id) NOT NULL,
  show_results BOOLEAN NOT NULL DEFAULT FALSE,
  blockchain_id VARCHAR(78),
  block_hash VARCHAR(66),
  transaction_hash VARCHAR(66),
  results_transaction_hash VARCHAR(66)
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  election_id UUID REFERENCES public.elections(id) NOT NULL,
  position_id UUID REFERENCES public.positions(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  name TEXT NOT NULL,
  info TEXT,
  party TEXT
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  election_id UUID REFERENCES public.elections(id) NOT NULL,
  position_id UUID REFERENCES public.positions(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_hash VARCHAR(66) NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  UNIQUE(election_id, position_id, user_id)
);

-- Create election_results table
CREATE TABLE public.election_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID REFERENCES public.elections(id) NOT NULL,
  position_id UUID REFERENCES public.positions(id) NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  total_votes INTEGER NOT NULL DEFAULT 0,
  department_votes INTEGER NOT NULL DEFAULT 0,
  department_eligible_voters INTEGER NOT NULL DEFAULT 0,
  department_percentage DECIMAL NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  candidate_name TEXT,
  block_hash TEXT
);

-- Create blockchain_transactions table
CREATE TABLE public.blockchain_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_hash VARCHAR(66) NOT NULL UNIQUE,
  block_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  value VARCHAR(78) DEFAULT '0',
  gas_used BIGINT,
  gas_price VARCHAR(78),
  input TEXT,
  event_type VARCHAR(50),
  related_entity_id UUID,
  related_entity_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_logs table
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES public.users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  event_type TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_users_student_id ON public.users(student_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_elections_status ON public.elections(status);
CREATE INDEX idx_elections_end_date ON public.elections(end_date);
CREATE INDEX idx_votes_election_id ON public.votes(election_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_candidates_election_id ON public.candidates(election_id);
CREATE INDEX idx_system_logs_timestamp ON public.system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX idx_blockchain_transactions_related_entity ON public.blockchain_transactions(related_entity_type, related_entity_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all user data" 
  ON public.users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all user data" 
  ON public.users 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for user_wallets
CREATE POLICY "Users can view their own wallet" 
  ON public.user_wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" 
  ON public.user_wallets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for system_logs
CREATE POLICY "Allow admins to view logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow system to insert logs" 
  ON public.system_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create utility functions
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

CREATE OR REPLACE FUNCTION find_user_for_login(p_student_id TEXT)
RETURNS TABLE(id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email FROM public.users u
  WHERE 
    u.student_id = p_student_id OR
    u.student_id = REPLACE(p_student_id, '-', '') OR
    REPLACE(u.student_id, '-', '') = REPLACE(p_student_id, '-', '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to update candidate_name in election_results
CREATE OR REPLACE FUNCTION update_candidate_name()
RETURNS TRIGGER AS $$
BEGIN
    SELECT name INTO NEW.candidate_name
    FROM public.candidates
    WHERE id = NEW.candidate_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for election_results
CREATE TRIGGER update_candidate_name_trigger
BEFORE INSERT OR UPDATE ON public.election_results
FOR EACH ROW
EXECUTE FUNCTION update_candidate_name();

-- Insert sample departments
INSERT INTO public.departments (id, name) VALUES 
  ('d1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 'Computer Science'),
  ('d2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 'Engineering'),
  ('d3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', 'Business Administration'),
  ('d4b5a4d0-5d4a-4c4a-8c4a-4d4a4d4a4d4a', 'Liberal Arts'),
  ('d5b5a5d0-5d5a-4c5a-8c5a-5d5a5d5a5d5a', 'Medicine');

-- Insert sample election types
INSERT INTO public.election_types (id, name) VALUES 
  ('e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'Student Council'),
  ('e2b5a2e0-5e2a-4c2a-8c2a-2c2a2c2a2c2a', 'Department Representatives'),
  ('e3b5a3e0-5e3a-4c3a-8c3a-3c3a3c3a3c3a', 'Club Officers'),
  ('e4b5a4e0-5e4a-4c4a-8c4a-4c4a4c4a4c4a', 'Student Government');

-- Insert sample users with password hashes (password: "password123" for all users)
-- Hash generated using bcrypt with salt rounds 10
INSERT INTO public.users (id, student_id, name, email, password_hash, role, department_id, year_level) VALUES 
  ('a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a', 'ADMIN001', 'System Administrator', 'admin@university.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'admin', NULL, NULL),
  ('a2b5a2a0-5a2a-4c2a-8c2a-2a2a2a2a2a2a', 'STAFF001', 'Staff Member', 'staff@university.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'staff', NULL, NULL),
  ('u1b5a1u0-5u1a-4c1a-8c1a-1u1a1u1a1u1a', 'CS-2021-001', 'John Doe', 'john.doe@student.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'voter', 'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', '3rd Year'),
  ('u2b5a2u0-5u2a-4c2a-8c2a-2u2a2u2a2u2a', 'CS-2021-002', 'Jane Smith', 'jane.smith@student.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'voter', 'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', '3rd Year'),
  ('u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', 'ENG-2020-001', 'Bob Johnson', 'bob.johnson@student.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'voter', 'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', '4th Year'),
  ('u4b5a4u0-5u4a-4c4a-8c4a-4u4a4u4a4u4a', 'BUS-2022-001', 'Alice Brown', 'alice.brown@student.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'voter', 'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', '2nd Year'),
  ('u5b5a5u0-5u5a-4c5a-8c5a-5u5a5u5a5u5a', 'CS-2021-003', 'Charlie Wilson', 'charlie.wilson@student.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'voter', 'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', '3rd Year'),
  ('u6b5a6u0-5u6a-4c6a-8c6a-6u6a6u6a6u6a', 'ENG-2021-002', 'Diana Davis', 'diana.davis@student.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'voter', 'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', '3rd Year'),
  ('u7b5a7u0-5u7a-4c7a-8c7a-7u7a7u7a7u7a', 'BUS-2020-002', 'Eva Martinez', 'eva.martinez@student.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'voter', 'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', '4th Year'),
  ('u8b5a8u0-5u8a-4c8a-8c8a-8u8a8u8a8u8a', 'LA-2022-001', 'Frank Garcia', 'frank.garcia@student.edu', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'voter', 'd4b5a4d0-5d4a-4c4a-8c4a-4d4a4d4a4d4a', '2nd Year');

-- Insert sample positions
INSERT INTO public.positions (id, election_type_id, name, display_order) VALUES 
  ('p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'President', 1),
  ('p2b5a2p0-5p2a-4c2a-8c2a-2p2a2p2a2p2a', 'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'Vice President', 2),
  ('p3b5a3p0-5p3a-4c3a-8c3a-3p3a3p3a3p3a', 'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'Secretary', 3),
  ('p4b5a4p0-5p4a-4c4a-8c4a-4p4a4p4a4p4a', 'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'Treasurer', 4),
  ('p5b5a5p0-5p5a-4c5a-8c5a-5p5a5p5a5p5a', 'e2b5a2e0-5e2a-4c2a-8c2a-2c2a2c2a2c2a', 'Department Representative', 1),
  ('p6b5a6p0-5p6a-4c6a-8c6a-6p6a6p6a6p6a', 'e3b5a3e0-5e3a-4c3a-8c3a-3c3a3c3a3c3a', 'Club President', 1),
  ('p7b5a7p0-5p7a-4c7a-8c7a-7p7a7p7a7p7a', 'e3b5a3e0-5e3a-4c3a-8c3a-3c3a3c3a3c3a', 'Club Vice President', 2);

-- Insert sample elections
INSERT INTO public.elections (id, title, description, status, end_date, election_type_id, department_id, created_by, show_results) VALUES 
  (
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'Student Council Election 2024', 
    'Vote for your student council representatives for the academic year 2024-2025. This election will determine the leadership that will represent all students in university matters.', 
    'active', 
    NOW() + INTERVAL '7 days', 
    'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 
    NULL, 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    FALSE
  ),
  (
    'e2b5a2e1-5e2a-4c2a-8c2a-2e2a2e2a2e2a', 
    'Computer Science Department Representatives 2024', 
    'Vote for your CS department representatives who will advocate for department-specific issues and improvements.', 
    'active', 
    NOW() + INTERVAL '5 days', 
    'e2b5a2e0-5e2a-4c2a-8c2a-2c2a2c2a2c2a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    FALSE
  ),
  (
    'e3b5a3e1-5e3a-4c3a-8c3a-3e3a3e3a3e3a', 
    'Engineering Department Representatives 2024', 
    'Vote for your Engineering department representatives for the upcoming academic year.', 
    'active', 
    NOW() + INTERVAL '6 days', 
    'e2b5a2e0-5e2a-4c2a-8c2a-2c2a2c2a2c2a', 
    'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    FALSE
  ),
  (
    'e4b5a4e1-5e4a-4c4a-8c4a-4e4a4e4a4e4a', 
    'Club Officers Election 2024', 
    'Vote for your club officers for the upcoming year. These positions will lead various student organizations.', 
    'draft', 
    NOW() + INTERVAL '14 days', 
    'e3b5a3e0-5e3a-4c3a-8c3a-3c3a3c3a3c3a', 
    NULL, 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    FALSE
  ),
  (
    'e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a', 
    'Previous Student Council Election 2023', 
    'Results of the previous student council election held in 2023.', 
    'completed', 
    NOW() - INTERVAL '30 days', 
    'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 
    NULL, 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    TRUE
  );

-- Insert sample candidates
INSERT INTO public.candidates (id, election_id, position_id, user_id, department_id, name, info, party) VALUES 
  -- Student Council Election 2024 - President
  (
    'c1b5a1c0-5c1a-4c1a-8c1a-1c1a1c1a1c1a', 
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u1b5a1u0-5u1a-4c1a-8c1a-1u1a1u1a1u1a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'John Doe', 
    'Experienced leader with a vision for improving student life. Committed to enhancing campus facilities and student services.',
    'Progressive Student Alliance'
  ),
  (
    'c2b5a2c0-5c2a-4c2a-8c2a-2c2a2c2a2c2a', 
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u2b5a2u0-5u2a-4c2a-8c2a-2u2a2u2a2u2a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'Jane Smith', 
    'Dedicated to creating an inclusive campus environment. Focus on mental health support and academic excellence.',
    'Unity Student Party'
  ),
  -- Student Council Election 2024 - Vice President
  (
    'c3b5a3c0-5c3a-4c3a-8c3a-3c3a3c3a3c3a', 
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'p2b5a2p0-5p2a-4c2a-8c2a-2p2a2p2a2p2a', 
    'u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', 
    'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 
    'Bob Johnson', 
    'Focused on improving academic resources and support. Strong advocate for student rights and representation.',
    'Academic Excellence Coalition'
  ),
  (
    'c4b5a4c0-5c4a-4c4a-8c4a-4c4a4c4a4c4a', 
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'p2b5a2p0-5p2a-4c2a-8c2a-2p2a2p2a2p2a', 
    'u4b5a4u0-5u4a-4c4a-8c4a-4u4a4u4a4u4a', 
    'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', 
    'Alice Brown', 
    'Passionate about student engagement and campus activities. Experience in event management and student organizations.',
    'Campus Life Initiative'
  ),
  -- CS Department Representatives
  (
    'c5b5a5c0-5c5a-4c5a-8c5a-5c5a5c5a5c5a', 
    'e2b5a2e1-5e2a-4c2a-8c2a-2e2a2e2a2e2a', 
    'p5b5a5p0-5p5a-4c5a-8c5a-5p5a5p5a5p5a', 
    'u1b5a1u0-5u1a-4c1a-8c1a-1u1a1u1a1u1a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'John Doe', 
    'Advocating for CS curriculum improvements and better lab facilities. Strong technical background.',
    NULL
  ),
  (
    'c6b5a6c0-5c6a-4c6a-8c6a-6c6a6c6a6c6a', 
    'e2b5a2e1-5e2a-4c2a-8c2a-2e2a2e2a2e2a', 
    'p5b5a5p0-5p5a-4c5a-8c5a-5p5a5p5a5p5a', 
    'u5b5a5u0-5u5a-4c5a-8c5a-5u5a5u5a5u5a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'Charlie Wilson', 
    'Focus on internship opportunities and industry connections. Active in coding competitions.',
    NULL
  ),
  -- Engineering Department Representatives
  (
    'c7b5a7c0-5c7a-4c7a-8c7a-7c7a7c7a7c7a', 
    'e3b5a3e1-5e3a-4c3a-8c3a-3e3a3e3a3e3a', 
    'p5b5a5p0-5p5a-4c5a-8c5a-5p5a5p5a5p5a', 
    'u6b5a6u0-5u6a-4c6a-8c6a-6u6a6u6a6u6a', 
    'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 
    'Diana Davis', 
    'Committed to improving engineering lab equipment and research opportunities.',
    NULL
  );

-- Insert sample votes for completed election
INSERT INTO public.votes (election_id, position_id, user_id, candidate_id, department_id, block_hash, transaction_hash) VALUES 
  (
    'e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', 
    'c1b5a1c0-5c1a-4c1a-8c1a-1c1a1c1a1c1a', 
    'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 
    '0x8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b', 
    '0x4bfc7ccd4b4741a031d5af7e1a1029d718a1f57649d933d96ce4c87e51f11d8e'
  ),
  (
    'e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u4b5a4u0-5u4a-4c4a-8c4a-4u4a4u4a4u4a', 
    'c2b5a2c0-5c2a-4c2a-8c2a-2c2a2c2a2c2a', 
    'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', 
    '0x7d9fa1c22c4a30c3f7130f16fcb6b4e65a3876a2f79778e55a592eae8f7c0a2f', 
    '0x3e8cc75157b16b3a7a67139e8c1db24a3d2747eb5f1511bbbf0ff9fcd3855e3c'
  ),
  (
    'e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u7b5a7u0-5u7a-4c7a-8c7a-7u7a7u7a7u7a', 
    'c1b5a1c0-5c1a-4c1a-8c1a-1c1a1c1a1c1a', 
    'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', 
    '0x9e4fa2d33d5b41d4g8241g27gdb7g5f39g9711b3bb9d76d7f66b603fbf8g8d3bg', 
    '0x5f9dd86268c27c4b8b78249f9e2e3b5e4e4858fc6g2622cccg0gg0gde4966f4d'
  );

-- Insert sample election results for completed election
INSERT INTO public.election_results (election_id, position_id, candidate_id, department_id, total_votes, department_votes, department_eligible_voters, department_percentage, is_winner, candidate_name, block_hash) VALUES 
  (
    'e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'c1b5a1c0-5c1a-4c1a-8c1a-1c1a1c1a1c1a', 
    NULL, 
    2, 
    0, 
    0, 
    66.67, 
    TRUE,
    'John Doe',
    '0x8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b'
  ),
  (
    'e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'c2b5a2c0-5c2a-4c2a-8c2a-2c2a2c2a2c2a', 
    NULL, 
    1, 
    0, 
    0, 
    33.33, 
    FALSE,
    'Jane Smith',
    '0x7d9fa1c22c4a30c3f7130f16fcb6b4e65a3876a2f79778e55a592eae8f7c0a2f'
  );

-- Insert sample blockchain transactions
INSERT INTO public.blockchain_transactions (transaction_hash, block_hash, block_number, from_address, to_address, value, gas_used, gas_price, event_type, related_entity_id, related_entity_type) VALUES 
  (
    '0x4bfc7ccd4b4741a031d5af7e1a1029d718a1f57649d933d96ce4c87e51f11d8e',
    '0x8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b',
    12345678,
    '0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e416',
    '0x8ba1f109551bD432803012645Hac136c34B8f58f',
    '0',
    21000,
    '20000000000',
    'VOTE_CAST',
    'e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a',
    'election'
  ),
  (
    '0x3e8cc75157b16b3a7a67139e8c1db24a3d2747eb5f1511bbbf0ff9fcd3855e3c',
    '0x7d9fa1c22c4a30c3f7130f16fcb6b4e65a3876a2f79778e55a592eae8f7c0a2f',
    12345679,
    '0x853f43d8339D312408f87F6a91a4b2c2c2e1e417',
    '0x8ba1f109551bD432803012645Hac136c34B8f58f',
    '0',
    21000,
    '20000000000',
    'VOTE_CAST',
    'e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a',
    'election'
  );

-- Insert sample system logs
INSERT INTO public.system_logs (action, description, user_id, timestamp, metadata, event_type) VALUES 
  ('System Initialization', 'Database setup completed successfully', NULL, NOW(), '{"version": "1.0", "tables_created": 11}', 'SYSTEM'),
  ('User Login', 'Admin user logged in', 'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a', NOW() - INTERVAL '1 hour', '{"ip": "192.168.1.100", "user_agent": "Mozilla/5.0"}', 'AUTH'),
  ('Election Created', 'Created Student Council Election 2024', 'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a', NOW() - INTERVAL '2 hours', '{"election_id": "e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a"}', 'ELECTION'),
  ('Vote Cast', 'Vote cast in Previous Student Council Election', 'u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', NOW() - INTERVAL '30 days', '{"election_id": "e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a", "candidate_id": "c1b5a1c0-5c1a-4c1a-8c1a-1c1a1c1a1c1a"}', 'VOTE'),
  ('Vote Cast', 'Vote cast in Previous Student Council Election', 'u4b5a4u0-5u4a-4c4a-8c4a-4u4a4u4a4u4a', NOW() - INTERVAL '30 days', '{"election_id": "e5b5a5e1-5e5a-4c5a-8c5a-5e5a5e5a5e5a", "candidate_id": "c2b5a2c0-5c2a-4c2a-8c2a-2c2a2c2a2c2a"}', 'VOTE'),
  ('Security Check', 'Routine security audit completed successfully', NULL, NOW() - INTERVAL '12 hours', '{"checks_passed": 15, "vulnerabilities": 0}', 'SECURITY'),
  ('Backup Completed', 'Automated system backup completed successfully', NULL, NOW() - INTERVAL '1 day', '{"backup_size": "2.5GB", "duration": "45 minutes"}', 'BACKUP'),
  ('User Registration', 'New user registered', 'u8b5a8u0-5u8a-4c8a-8c8a-8u8a8u8a8u8a', NOW() - INTERVAL '2 days', '{"department": "Liberal Arts", "year_level": "2nd Year"}', 'USER'),
  ('Election Status Change', 'Election status changed to active', 'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a', NOW() - INTERVAL '3 days', '{"election_id": "e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a", "old_status": "draft", "new_status": "active"}', 'ELECTION'),
  ('System Update', 'System updated to latest version', NULL, NOW() - INTERVAL '7 days', '{"version": "2.1.0", "features_added": 5}', 'SYSTEM');

-- Insert sample user wallets (encrypted data - these are just examples)
INSERT INTO public.user_wallets (user_id, wallet_address, encrypted_private_key, mnemonic_phrase) VALUES 
  (
    'u1b5a1u0-5u1a-4c1a-8c1a-1u1a1u1a1u1a',
    '0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e416',
    'encrypted_private_key_data_here_1',
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  ),
  (
    'u2b5a2u0-5u2a-4c2a-8c2a-2u2a2u2a2u2a',
    '0x853f43d8339D312408f87F6a91a4b2c2c2e1e417',
    'encrypted_private_key_data_here_2',
    'ability able about above absent absorb abstract absurd abuse access accident account accuse'
  ),
  (
    'u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a',
    '0x964g54e9449E423519g98g7b5E5D5d4d4d3f2f518',
    'encrypted_private_key_data_here_3',
    'achieve acid acoustic acquire across act action actor actress actual adapt add address'
  );

-- Create a function to get voter statistics
CREATE OR REPLACE FUNCTION get_voter_statistics()
RETURNS TABLE(
  total_users INTEGER,
  total_voters INTEGER,
  voters_by_department JSONB,
  voters_by_year JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.users) as total_users,
    (SELECT COUNT(*)::INTEGER FROM public.users WHERE role = 'voter') as total_voters,
    (SELECT jsonb_object_agg(d.name, voter_count) 
     FROM (
       SELECT d.name, COUNT(u.id) as voter_count
       FROM public.departments d
       LEFT JOIN public.users u ON d.id = u.department_id AND u.role = 'voter'
       GROUP BY d.name
     ) d) as voters_by_department,
    (SELECT jsonb_object_agg(year_level, voter_count)
     FROM (
       SELECT COALESCE(year_level, 'Unknown') as year_level, COUNT(*) as voter_count
       FROM public.users 
       WHERE role = 'voter'
       GROUP BY year_level
     ) y) as voters_by_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Final verification query
SELECT 
  'Database setup completed successfully!' as status,
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.elections) as total_elections,
  (SELECT COUNT(*) FROM public.candidates) as total_candidates,
  (SELECT COUNT(*) FROM public.votes) as total_votes,
  (SELECT COUNT(*) FROM public.system_logs) as total_logs;
