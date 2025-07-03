import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey)

const createClient = supabaseCreateClient

// Export the supabase client
export { createClient }
