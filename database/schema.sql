-- Create the necessary tables for the voting system

-- Election Types
CREATE TABLE election_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'voter',
  department_id UUID REFERENCES departments(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  election_type_id UUID REFERENCES election_types(id) NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Elections
CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  election_type_id UUID REFERENCES election_types(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  created_by UUID REFERENCES users(id) NOT NULL,
  show_results BOOLEAN NOT NULL DEFAULT FALSE
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  election_id UUID REFERENCES elections(id) NOT NULL,
  position_id UUID REFERENCES positions(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  info TEXT
);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  election_id UUID REFERENCES elections(id) NOT NULL,
  position_id UUID REFERENCES positions(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_hash TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  UNIQUE(election_id, position_id, user_id)
);

-- Election Results
CREATE TABLE election_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID REFERENCES elections(id) NOT NULL,
  position_id UUID REFERENCES positions(id) NOT NULL,
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  total_votes INTEGER NOT NULL DEFAULT 0,
  department_votes INTEGER NOT NULL DEFAULT 0,
  department_eligible_voters INTEGER NOT NULL DEFAULT 0,
  department_percentage DECIMAL NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE
);

-- System Logs
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  details TEXT,
  ip_address TEXT,
  user_agent TEXT
);
