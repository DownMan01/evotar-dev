import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create the Supabase client
const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session in browser storage
  },
})

const createClient = supabaseCreateClient

// Export the supabase client
export { supabase }
export { createClient }

export type Election = {
  id: string
  created_at: string
  title: string
  description: string
  status: string
  end_date: string
  election_type_id: string
  department_id: string | null
  created_by: string
  show_results: boolean
}

export type Candidate = {
  id: string
  created_at: string
  election_id: string
  position_id: string
  user_id: string
  department_id: string | null
  name: string
  info: string
  position: Position
  department: Department | null
  user?: User | null
  party?: string | null
}

export type Position = {
  id: string
  created_at: string
  election_type_id: string
  name: string
  display_order: number
}

export type ElectionResult = {
  id: string
  election_id: string
  position_id: string
  candidate_id: string
  department_id: string | null
  total_votes: number
  department_votes: number
  department_eligible_voters: number
  department_percentage: number
  is_winner: boolean
  candidate_name?: string
  block_hash?: string
}

export type Vote = {
  id: string
  created_at: string
  election_id: string
  position_id: string
  user_id: string
  candidate_id: string
  department_id: string | null
  timestamp: string
  block_hash: string
  transaction_hash: string
}

export type User = {
  id: string
  created_at: string
  student_id: string
  name: string
  email: string
  role: string
  department_id: string | null
  year_level: string
  wallet_address: string
  user_mnemonic: string
  user_img: string
  department?: Department | null
  profile_url?: string
}

export type Department = {
  id: string
  created_at: string
  name: string
}
