-- Complete database setup with proper password hashing
-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.blockchain_transactions CASCADE;
DROP TABLE IF EXISTS public.election_results CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.elections CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.election_types CASCADE;
DROP TABLE IF EXISTS public.user_wallets CASCADE;
DROP TABLE IF EXISTS public.system_logs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create departments table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table with password hash
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'voter' CHECK (role IN ('voter', 'staff', 'admin')),
    department_id UUID REFERENCES public.departments(id),
    year_level INTEGER,
    user_img TEXT,
    wallet_address VARCHAR(255),
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create election_types table
CREATE TABLE public.election_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create positions table
CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    election_type_id UUID REFERENCES public.election_types(id),
    department_id UUID REFERENCES public.departments(id),
    max_candidates INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create elections table
CREATE TABLE public.elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    election_type_id UUID REFERENCES public.election_types(id),
    position_id UUID REFERENCES public.positions(id),
    department_id UUID REFERENCES public.departments(id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    show_results BOOLEAN DEFAULT false,
    blockchain_enabled BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE public.candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    platform TEXT,
    image_url TEXT,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.users(id),
    blockchain_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(election_id, voter_id)
);

-- Create election_results table
CREATE TABLE public.election_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    vote_count INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_logs table
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES public.users(id),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_wallets table
CREATE TABLE public.user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    encrypted_private_key TEXT,
    mnemonic_phrase TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blockchain_transactions table
CREATE TABLE public.blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vote_id UUID REFERENCES public.votes(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(255) NOT NULL UNIQUE,
    block_number BIGINT,
    gas_used BIGINT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Insert departments
INSERT INTO public.departments (id, name, code, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Computer Science', 'CS', 'Department of Computer Science and Information Technology'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Engineering', 'ENG', 'College of Engineering'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Business Administration', 'BA', 'School of Business Administration'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Liberal Arts', 'LA', 'College of Liberal Arts and Sciences'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Medicine', 'MED', 'College of Medicine');

-- Insert election types
INSERT INTO public.election_types (id, name, description) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Student Council', 'University-wide student council elections'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Department Representatives', 'Department-specific representative elections'),
    ('660e8400-e29b-41d4-a716-446655440003', 'Club Officers', 'Student club and organization officer elections'),
    ('660e8400-e29b-41d4-a716-446655440004', 'Student Government', 'Student government position elections');

-- Insert users with hashed passwords (password: "password123")
INSERT INTO public.users (id, email, student_id, name, role, department_id, year_level, password_hash, is_active) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'admin@university.edu', 'ADMIN001', 'System Administrator', 'admin', NULL, NULL, crypt('password123', gen_salt('bf')), true),
    ('770e8400-e29b-41d4-a716-446655440002', 'staff@university.edu', 'STAFF001', 'Election Staff', 'staff', '550e8400-e29b-41d4-a716-446655440001', NULL, crypt('password123', gen_salt('bf')), true),
    ('770e8400-e29b-41d4-a716-446655440003', 'john.doe@student.edu', 'CS-2021-001', 'John Doe', 'voter', '550e8400-e29b-41d4-a716-446655440001', 3, crypt('password123', gen_salt('bf')), true),
    ('770e8400-e29b-41d4-a716-446655440004', 'jane.smith@student.edu', 'ENG-2020-002', 'Jane Smith', 'voter', '550e8400-e29b-41d4-a716-446655440002', 4, crypt('password123', gen_salt('bf')), true),
    ('770e8400-e29b-41d4-a716-446655440005', 'mike.johnson@student.edu', 'BA-2022-003', 'Mike Johnson', 'voter', '550e8400-e29b-41d4-a716-446655440003', 2, crypt('password123', gen_salt('bf')), true),
    ('770e8400-e29b-41d4-a716-446655440006', 'sarah.wilson@student.edu', 'LA-2021-004', 'Sarah Wilson', 'voter', '550e8400-e29b-41d4-a716-446655440004', 3, crypt('password123', gen_salt('bf')), true),
    ('770e8400-e29b-41d4-a716-446655440007', 'david.brown@student.edu', 'MED-2019-005', 'David Brown', 'voter', '550e8400-e29b-41d4-a716-446655440005', 5, crypt('password123', gen_salt('bf')), true),
    ('770e8400-e29b-41d4-a716-446655440008', 'lisa.garcia@student.edu', 'CS-2023-006', 'Lisa Garcia', 'voter', '550e8400-e29b-41d4-a716-446655440001', 1, crypt('password123', gen_salt('bf')), true);

-- Insert positions
INSERT INTO public.positions (id, name, description, election_type_id, department_id) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', 'Student Council President', 'University-wide student body president', '660e8400-e29b-41d4-a716-446655440001', NULL),
    ('880e8400-e29b-41d4-a716-446655440002', 'Student Council Vice President', 'University-wide student body vice president', '660e8400-e29b-41d4-a716-446655440001', NULL),
    ('880e8400-e29b-41d4-a716-446655440003', 'CS Department Representative', 'Computer Science department representative', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440004', 'Engineering Department Representative', 'Engineering department representative', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
    ('880e8400-e29b-41d4-a716-446655440005', 'Programming Club President', 'President of the Programming Club', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440006', 'Student Government Secretary', 'Secretary of student government', '660e8400-e29b-41d4-a716-446655440004', NULL),
    ('880e8400-e29b-41d4-a716-446655440007', 'Student Government Treasurer', 'Treasurer of student government', '660e8400-e29b-41d4-a716-446655440004', NULL),
    ('880e8400-e29b-41d4-a716-446655440008', 'Business Club President', 'President of the Business Club', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003');

-- Insert elections
INSERT INTO public.elections (id, title, description, election_type_id, position_id, department_id, start_date, end_date, status, show_results, created_by) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', '2024 Student Council President Election', 'Annual election for student council president', '660e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', NULL, NOW() - INTERVAL '1 day', NOW() + INTERVAL '7 days', 'active', false, '770e8400-e29b-41d4-a716-446655440002'),
    ('990e8400-e29b-41d4-a716-446655440002', '2024 CS Department Representative', 'Computer Science department representative election', '660e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'active', false, '770e8400-e29b-41d4-a716-446655440002'),
    ('990e8400-e29b-41d4-a716-446655440003', '2024 Programming Club Officers', 'Annual programming club officer elections', '660e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', NOW() + INTERVAL '1 day', NOW() + INTERVAL '10 days', 'active', false, '770e8400-e29b-41d4-a716-446655440002'),
    ('990e8400-e29b-41d4-a716-446655440004', '2024 Student Government Secretary', 'Student government secretary position', '660e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440006', NULL, NOW() + INTERVAL '3 days', NOW() + INTERVAL '12 days', 'draft', false, '770e8400-e29b-41d4-a716-446655440002'),
    ('990e8400-e29b-41d4-a716-446655440005', '2023 Engineering Representative (Completed)', 'Completed engineering department election', '660e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '30 days', NOW() - INTERVAL '23 days', 'completed', true, '770e8400-e29b-41d4-a716-446655440002');

-- Insert candidates
INSERT INTO public.candidates (id, election_id, user_id, name, description, platform, vote_count) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'John Doe', 'Computer Science student with leadership experience', 'Improving campus technology and student services', 0),
    ('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440006', 'Sarah Wilson', 'Liberal Arts student passionate about student rights', 'Enhancing student life and academic support', 0),
    ('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'John Doe', 'CS student running for department representative', 'Bridging gap between students and faculty', 0),
    ('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440008', 'Lisa Garcia', 'First-year CS student with fresh perspectives', 'Modernizing CS curriculum and resources', 0),
    ('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'John Doe', 'Experienced programmer and club member', 'Organizing more coding competitions and workshops', 0),
    ('aa0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004', 'Jane Smith', 'Engineering student (completed election)', 'Completed election candidate', 45),
    ('aa0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440007', 'David Brown', 'Engineering student (completed election)', 'Completed election candidate', 32);

-- Insert sample votes for completed election
INSERT INTO public.votes (id, election_id, candidate_id, voter_id, created_at) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '25 days'),
    ('bb0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '25 days'),
    ('bb0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440006', NOW() - INTERVAL '24 days'),
    ('bb0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440008', NOW() - INTERVAL '24 days');

-- Insert election results for completed election
INSERT INTO public.election_results (id, election_id, candidate_id, vote_count, percentage, is_winner) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440006', 45, 58.44, true),
    ('cc0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440007', 32, 41.56, false);

-- Insert system logs
INSERT INTO public.system_logs (id, action, description, user_id, created_at) VALUES
    ('dd0e8400-e29b-41d4-a716-446655440001', 'System Startup', 'Voting system initialized', '770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '7 days'),
    ('dd0e8400-e29b-41d4-a716-446655440002', 'Election Created', 'Student Council President election created', '770e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '5 days'),
    ('dd0e8400-e29b-41d4-a716-446655440003', 'User Login', 'Admin user logged in', '770e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 hour'),
    ('dd0e8400-e29b-41d4-a716-446655440004', 'Vote Cast', 'Vote cast in Engineering Representative election', '770e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '25 days');

-- Insert sample wallet data
INSERT INTO public.user_wallets (id, user_id, wallet_address, encrypted_private_key, mnemonic_phrase) VALUES
    ('ee0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', '0x1234567890123456789012345678901234567890', 'encrypted_private_key_1', 'sample mnemonic phrase one'),
    ('ee0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', '0x2345678901234567890123456789012345678901', 'encrypted_private_key_2', 'sample mnemonic phrase two'),
    ('ee0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', '0x3456789012345678901234567890123456789012', 'encrypted_private_key_3', 'sample mnemonic phrase three');

-- Create database functions
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

CREATE OR REPLACE FUNCTION verify_user_password(p_user_id UUID, p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM public.users
  WHERE id = p_user_id;
  
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (stored_hash = crypt(p_password, stored_hash));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_voter_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.users WHERE role = 'voter' AND is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_voters_voted_count(p_election_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT voter_id) FROM public.votes WHERE election_id = p_election_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_users_student_id ON public.users(student_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_elections_status ON public.elections(status);
CREATE INDEX idx_votes_election_voter ON public.votes(election_id, voter_id);
CREATE INDEX idx_candidates_election ON public.candidates(election_id);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Anyone can view active elections" ON public.elections FOR SELECT USING (true);
CREATE POLICY "Staff and admin can manage elections" ON public.elections FOR ALL USING (true);

CREATE POLICY "Anyone can view candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Staff and admin can manage candidates" ON public.candidates FOR ALL USING (true);

CREATE POLICY "Users can view their own votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users can cast votes" ON public.votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view election results" ON public.election_results FOR SELECT USING (true);

CREATE POLICY "Admin can view system logs" ON public.system_logs FOR SELECT USING (true);
CREATE POLICY "System can insert logs" ON public.system_logs FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
