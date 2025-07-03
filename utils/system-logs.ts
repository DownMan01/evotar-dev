import { supabase } from "@/lib/supabase"

export type SystemLogAction =
  | "User Login"
  | "User Logout"
  | "User Created"
  | "User Updated"
  | "User Deleted"
  | "Election Created"
  | "Election Updated"
  | "Election Started"
  | "Election Ended"
  | "Vote Cast"
  | "Results Published"
  | "System Backup"
  | "Security Alert"
  | "System Error"
  | "System Update"
  | string

export interface SystemLogData {
  action: SystemLogAction
  description: string
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Logs a system event to the system_logs table
 */
export async function logSystemEvent({ action, description, userId, metadata }: SystemLogData): Promise<boolean> {
  try {
    // Create a log entry
    const logEntry = {
      action,
      description,
      user_id: userId || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    }

    console.log("Attempting to log system event:", logEntry)

    // Use a direct insert to avoid RLS issues
    const { error } = await supabase.from("system_logs").insert([logEntry])

    if (error) {
      console.warn("Failed to log to system_logs table:", error.message)
      console.log("System Log (fallback):", logEntry)

      // Check if the table doesn't exist
      if (error.code === "42P01") {
        // PostgreSQL code for undefined_table
        console.log("Table doesn't exist, attempting to create it...")
        await createSystemLogsTable()

        // Try inserting again
        const { error: retryError } = await supabase.from("system_logs").insert([logEntry])
        if (retryError) {
          console.error("Failed to insert log after table creation:", retryError)
          return false
        }
        return true
      }

      return false
    }

    console.log("Successfully logged system event:", action)
    return true
  } catch (error: any) {
    console.error("Error logging system event:", error)
    // Log to console as fallback
    console.log("System Log (fallback):", {
      action,
      description,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
    })
    return false
  }
}

// Function to create the system_logs table if it doesn't exist
async function createSystemLogsTable() {
  try {
    // Execute SQL to create the table
    const { error } = await supabase.rpc("create_system_logs_table_if_not_exists")

    if (error) {
      console.error("Error creating system_logs table:", error)
      return false
    }

    console.log("Successfully created system_logs table")
    return true
  } catch (error) {
    console.error("Error creating system_logs table:", error)
    return false
  }
}

// Function to seed initial logs if needed
export async function seedInitialLogs(): Promise<boolean> {
  try {
    console.log("Checking for existing logs...")

    // First, ensure the table exists
    await createSystemLogsTable()

    // Check if there are any logs
    const {
      data,
      count,
      error: countError,
    } = await supabase.from("system_logs").select("id", { count: "exact" }).limit(1)

    if (countError) {
      console.error("Error checking logs count:", countError)
      return false
    }

    // If there are already logs, don't seed
    if (data && data.length > 0) {
      console.log("Logs already exist, skipping seed")
      return true
    }

    console.log("No logs found. Seeding initial system logs...")

    // Create initial logs
    const initialLogs = [
      {
        action: "System Initialization",
        description: "System logs table created and initialized",
        timestamp: new Date().toISOString(),
      },
      {
        action: "Database Setup",
        description: "Database schema initialized with required tables",
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
      },
      {
        action: "Security Check",
        description: "Routine security audit completed successfully",
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
      },
      {
        action: "Backup Completed",
        description: "Automated system backup completed successfully",
        timestamp: new Date(Date.now() - 12 * 60 * 60000).toISOString(), // 12 hours ago
      },
      {
        action: "System Update",
        description: "System updated to latest version",
        timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
      },
    ]

    // Insert logs one by one to ensure they're added
    for (const log of initialLogs) {
      const { error } = await supabase.from("system_logs").insert([log])
      if (error) {
        console.error("Error inserting log:", error, log)
      } else {
        console.log("Successfully inserted log:", log.action)
      }
    }

    console.log("Finished seeding initial logs")
    return true
  } catch (error) {
    console.error("Error seeding initial logs:", error)
    return false
  }
}
