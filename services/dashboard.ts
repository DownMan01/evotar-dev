import { supabase } from "@/lib/supabase"

// Get active elections for dashboard
export async function getActiveElections(limit = 3) {
  try {
    console.log("Fetching active elections...")
    const { data, error } = await supabase
      .from("elections")
      .select(`
       *,
       election_type:election_types(*),
       department:departments(*)
     `)
      .eq("status", "active")
      .order("end_date", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("Error fetching active elections:", error)
      return []
    }

    console.log(`Found ${data?.length || 0} active elections`)
    return data || []
  } catch (err) {
    console.error("Exception in getActiveElections:", err)
    return []
  }
}

// Get completed elections with results
export async function getCompletedElectionsWithResults(limit = 3) {
  try {
    console.log("Fetching completed elections...")
    const { data, error } = await supabase
      .from("elections")
      .select(`
       *,
       election_type:election_types(*),
       department:departments(*)
     `)
      .eq("status", "completed")
      .eq("show_results", true)
      .order("end_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching completed elections:", error)
      return []
    }

    console.log(`Found ${data?.length || 0} completed elections`)
    return data || []
  } catch (err) {
    console.error("Exception in getCompletedElectionsWithResults:", err)
    return []
  }
}

// Get draft elections (for staff/admin)
export async function getDraftElections(limit = 3) {
  try {
    console.log("Fetching draft elections...")
    const { data, error } = await supabase
      .from("elections")
      .select(`
       *,
       election_type:election_types(*),
       department:departments(*)
     `)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching draft elections:", error)
      return []
    }

    console.log(`Found ${data?.length || 0} draft elections`)
    return data || []
  } catch (err) {
    console.error("Exception in getDraftElections:", err)
    return []
  }
}

// Get all elections with pagination (for admin/staff)
export async function getAllElections(page = 1, pageSize = 10) {
  try {
    console.log("Fetching all elections...")
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const { data, error, count } = await supabase
      .from("elections")
      .select(
        `
       *,
       election_type:election_types(*),
       department:departments(*)
     `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(start, end)

    if (error) {
      console.error("Error fetching all elections:", error)
      return { data: [], count: 0 }
    }

    console.log(`Found ${data?.length || 0} elections, total count: ${count || 0}`)
    return { data: data || [], count: count || 0 }
  } catch (err) {
    console.error("Exception in getAllElections:", err)
    return { data: [], count: 0 }
  }
}

// Get user voting statistics
export async function getUserVotingStats(userId: string) {
  try {
    console.log(`Fetching voting stats for user ${userId}...`)

    // Get total elections the user is eligible for
    const { count: totalElections, error: electionsError } = await supabase
      .from("elections")
      .select("*", { count: "exact", head: true })

    if (electionsError) {
      console.error("Error fetching total elections:", electionsError)
      throw electionsError
    }

    // Get elections the user has participated in
    const { data: userVotes, error: votesError } = await supabase
      .from("votes")
      .select("election_id")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })

    if (votesError) {
      console.error("Error fetching user votes:", votesError)
      throw votesError
    }

    // Get unique election IDs the user has voted in
    const participatedElectionIds = new Set(userVotes?.map((vote) => vote.election_id) || [])
    const participatedElections = participatedElectionIds.size

    // Calculate participation rate
    const participationRate = totalElections ? (participatedElections / totalElections) * 100 : 0

    console.log(`User stats: ${participatedElections}/${totalElections} elections, ${participationRate.toFixed(1)}%`)

    return {
      totalElections: totalElections || 0,
      participatedElections,
      participationRate: Math.round(participationRate),
      totalVotesCast: userVotes?.length || 0,
      securityScore: 98, // This could be calculated based on various security factors in a real app
    }
  } catch (error) {
    console.error("Error fetching user voting stats:", error)
    return {
      totalElections: 0,
      participatedElections: 0,
      participationRate: 0,
      totalVotesCast: 0,
      securityScore: 0,
    }
  }
}

// Get user recent activity
export async function getUserRecentActivity(userId: string, limit = 5) {
  try {
    console.log(`Fetching recent activity for user ${userId}...`)

    // Get user's recent votes
    const { data: recentVotes, error: votesError } = await supabase
      .from("votes")
      .select(`
       id,
       election_id,
       timestamp,
       block_hash,
       transaction_hash,
       election:elections(title)
     `)
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (votesError) {
      console.error("Error fetching user votes:", votesError)
      throw votesError
    }

    // Format the activity data
    const activity =
      recentVotes?.map((vote) => ({
        id: vote.id,
        type: "vote_cast",
        election: vote.election?.title || "Unknown Election",
        timestamp: vote.timestamp || new Date().toISOString(),
        blockHash: vote.block_hash,
        transactionHash: vote.transaction_hash,
      })) || []

    console.log(`Found ${activity.length} recent activities`)
    return activity
  } catch (error) {
    console.error("Error fetching user recent activity:", error)
    return []
  }
}

// Get system statistics for admin dashboard
export async function getSystemStats() {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Get users by role
    const { data: usersByRole } = await supabase.from("users").select("role")

    // Count users by role
    const voterCount = usersByRole?.filter((user) => user.role === "voter").length || 0
    const staffCount = usersByRole?.filter((user) => user.role === "staff").length || 0
    const adminCount = usersByRole?.filter((user) => user.role === "admin").length || 0

    // Get total elections count
    const { count: totalElections } = await supabase.from("elections").select("*", { count: "exact", head: true })

    // Get elections by status
    const { data: electionsByStatus } = await supabase.from("elections").select("status")

    // Count elections by status
    const activeElections = electionsByStatus?.filter((election) => election.status === "active").length || 0
    const completedElections = electionsByStatus?.filter((election) => election.status === "completed").length || 0
    const draftElections = electionsByStatus?.filter((election) => election.status === "draft").length || 0

    // Get total votes count
    const { count: totalVotes } = await supabase.from("votes").select("*", { count: "exact", head: true })

    return {
      users: {
        total: totalUsers || 0,
        voters: voterCount,
        staff: staffCount,
        admins: adminCount,
      },
      elections: {
        total: totalElections || 0,
        active: activeElections,
        completed: completedElections,
        draft: draftElections,
      },
      votes: totalVotes || 0,
      systemStatus: "healthy", // This could be determined by various system checks
    }
  } catch (error) {
    console.error("Error fetching system stats:", error)
    return {
      users: { total: 0, voters: 0, staff: 0, admins: 0 },
      elections: { total: 0, active: 0, completed: 0, draft: 0 },
      votes: 0,
      systemStatus: "unknown",
    }
  }
}

// Get recent system logs for admin dashboard
export async function getSystemLogs(limit = 5) {
  try {
    // First, fetch system logs without the user relationship
    const { data, error } = await supabase
      .from("system_logs")
      .select(`
       id,
       action,
       description,
       user_id,
       timestamp,
       metadata
     `)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === "42P01") {
        // PostgreSQL code for undefined_table
        console.error("System logs table does not exist:", error)
        return []
      }
      throw error
    }

    // If we have logs with user_ids, fetch the user information separately
    if (data && data.length > 0) {
      // Get all unique user IDs
      const userIds = data
        .map((log) => log.user_id)
        .filter((id) => id !== null && id !== undefined)
        .filter((id, index, self) => self.indexOf(id) === index)

      if (userIds.length > 0) {
        // Fetch users
        const { data: users, error: userError } = await supabase.from("users").select("id, name").in("id", userIds)

        if (!userError && users) {
          // Create a map for quick lookup
          const userMap = users.reduce((map, user) => {
            map[user.id] = user
            return map
          }, {})

          // Join the user data to each log
          return data.map((log) => ({
            ...log,
            user: log.user_id ? userMap[log.user_id] : null,
          }))
        }
      }
    }

    return data || []
  } catch (error) {
    console.error("Error fetching system logs:", error)
    return []
  }
}

// Get users for admin dashboard
export async function getUsers(limit = 10) {
  try {
    // Use RPC to call our custom function that bypasses RLS
    const { data, error } = await supabase.rpc("get_users_safe", { user_limit: limit })

    if (error) {
      console.error("Error fetching users via RPC:", error)

      // Fallback to a minimal query if RPC fails
      console.log("Attempting fallback query...")
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("users")
        .select("id, name, student_id, role")
        .limit(limit)

      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError)
        return []
      }

      return fallbackData || []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

// Add this function to get user counts
export async function getUserCounts() {
  try {
    // Make separate queries for each role to avoid RLS issues
    const [votersResult, staffResult, adminsResult] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "voter"),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "staff"),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "admin"),
    ])

    // Get the counts from each query
    const voterCount = votersResult.count || 0
    const staffCount = staffResult.count || 0
    const adminCount = adminsResult.count || 0
    const totalCount = voterCount + staffCount + adminCount

    return {
      total: totalCount,
      voters: voterCount,
      staff: staffCount,
      admins: adminCount,
    }
  } catch (error) {
    console.error("Error fetching user counts:", error)
    return {
      total: 0,
      voters: 0,
      staff: 0,
      admins: 0,
    }
  }
}
