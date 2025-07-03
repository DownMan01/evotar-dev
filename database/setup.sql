-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a trigger function to sync auth users with our custom users table
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, student_id, name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'voter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically insert new auth users into our users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create or update the users table to work with Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  student_id TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'voter',
  department_id UUID,
  year_level TEXT,
  wallet_address TEXT,
  user_mnemonic TEXT,
  user_img TEXT,
  CONSTRAINT valid_role CHECK (role IN ('voter', 'staff', 'admin'))
);

-- Create RLS policies for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow admins to read all user data
CREATE POLICY "Admins can view all user data" 
  ON public.users 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Allow admins to update all user data
CREATE POLICY "Admins can update all user data" 
  ON public.users 
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Create user_wallets table
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  mnemonic_phrase TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(wallet_address)
);

-- Create RLS policies for user_wallets
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own wallet
CREATE POLICY "Users can view their own wallet" 
  ON public.user_wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow admins to read all wallets
CREATE POLICY "Admins can view all wallets" 
  ON public.user_wallets 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Create a function to find users by student ID regardless of format
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

-- Create a function to find a user by student ID for login
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
