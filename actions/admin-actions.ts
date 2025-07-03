"use server"

import { createClient } from "@supabase/supabase-js"
import { getSession } from "@/actions/auth"

// Create Supabase admin client for database operations
function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function setupLogsFunctions() {
  try {
    const session = await getSession()

    // Only admin can run this
    if (!session?.isLoggedIn || session.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    const supabaseAdmin = createSupabaseAdminClient()

    // SQL to create the necessary functions
    const sql = `
      -- Create a function to execute SQL directly (with admin privileges)
      CREATE OR REPLACE FUNCTION exec_sql(sql text) 
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

      -- Create a function to get system logs with pagination
      CREATE OR REPLACE FUNCTION get_system_logs(page_number int, page_size int)
      RETURNS SETOF system_logs AS $$
      BEGIN
        RETURN QUERY
        SELECT *
        FROM system_logs
        ORDER BY timestamp DESC
        LIMIT page_size
        OFFSET ((page_number - 1) * page_size);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create a function to count system logs
      CREATE OR REPLACE FUNCTION get_system_logs_count()
      RETURNS bigint AS $$
      DECLARE
        log_count bigint;
      BEGIN
        SELECT COUNT(*) INTO log_count FROM system_logs;
        RETURN log_count;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Grant execute permissions
      GRANT EXECUTE ON FUNCTION get_system_logs TO authenticated;
      GRANT EXECUTE ON FUNCTION get_system_logs_count TO authenticated;
    `

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc("exec_sql", { sql })

    if (error) {
      // If exec_sql doesn't exist, we need to create it first
      if (error.code === "42883") {
        // function doesn't exist
        // Execute the SQL directly using the REST API
        const { error: directError } = await supabaseAdmin.from("_rpc").select("*").eq("name", "exec_sql")

        if (directError) {
          console.error("Error creating functions:", directError)
          return { success: false, error: directError.message }
        }
      } else {
        console.error("Error creating functions:", error)
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in setupLogsFunctions:", error)
    return { success: false, error: error.message }
  }
}

export async function getSystemLogs(page = 1, pageSize = 10) {
  try {
    const session = await getSession()

    // Only admin can run this
    if (!session?.isLoggedIn || session.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    const supabaseAdmin = createSupabaseAdminClient()

    // Get logs using the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("system_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      console.error("Error fetching logs:", error)
      return { success: false, error: error.message }
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from("system_logs")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error getting logs count:", countError)
    }

    return {
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    }
  } catch (error: any) {
    console.error("Error in getSystemLogs:", error)
    return { success: false, error: error.message }
  }
}
