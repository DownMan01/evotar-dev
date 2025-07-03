import { supabase } from "@/lib/supabase"
import type { Election, Candidate, Vote, ElectionResult, User, Position, Department } from "@/lib/supabase"

// Elections
export async function getElections() {
  const { data, error } = await supabase
    .from("elections")
    .select(`
     *,
     election_type:election_types(*),
     department:departments(*)
   `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching elections:", error)
    return []
  }

  return data as Election[]
}

export async function getElectionsByStatus(status: "draft" | "active" | "completed") {
  const { data, error } = await supabase
    .from("elections")
    .select(`
     *,
     election_type:election_types(*),
     department:departments(*)
   `)
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching ${status} elections:`, error)
    return []
  }

  return data as Election[]
}

export async function getElection(id: string) {
  const { data, error } = await supabase
    .from("elections")
    .select(`
     *,
     election_type:election_types(*),
     department:departments(*)
   `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching election:", error)
    return null
  }

  return data as Election
}

// Candidates
export async function getCandidates(electionId: string, positionId?: string) {
  let query = supabase
    .from("candidates")
    .select(`
     *,
     position:positions(*),
     department:departments(*),
     user:users(*)
   `)
    .eq("election_id", electionId)

  if (positionId) {
    query = query.eq("position_id", positionId)
  }

  const { data, error } = await query.order("created_at")

  if (error) {
    console.error("Error fetching candidates:", error)
    return []
  }

  return data as Candidate[]
}

// Votes
export async function getVotes(electionId: string) {
  const { data, error } = await supabase.from("votes").select("*").eq("election_id", electionId)

  if (error) {
    console.error("Error fetching votes:", error)
    return []
  }

  return data as Vote[]
}

export async function hasVoted(userId: string, electionId: string, positionId: string) {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("user_id", userId)
    .eq("election_id", electionId)
    .eq("position_id", positionId)
    .maybeSingle()

  if (error) {
    console.error("Error checking if user has voted:", error)
    return false
  }

  return !!data
}

// Results
export async function getElectionResults(electionId: string) {
  const { data, error } = await supabase
    .from("election_results")
    .select(`
     *,
     candidate:candidates(*),
     position:positions(*)
   `)
    .eq("election_id", electionId)

  if (error) {
    console.error("Error fetching election results:", error)
    return []
  }

  return data as (ElectionResult & { candidate: Candidate; position: Position })[]
}

// Positions
export async function getPositions(electionTypeId: string) {
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .eq("election_type_id", electionTypeId)
    .order("display_order")

  if (error) {
    console.error("Error fetching positions:", error)
    return []
  }

  return data as Position[]
}

// Departments
export async function getDepartments() {
  const { data, error } = await supabase.from("departments").select("*").order("name")

  if (error) {
    console.error("Error fetching departments:", error)
    return []
  }

  return data as Department[]
}

// Users
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(`
     *,
     department:departments(*)
   `)
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data as User & { department: Department }
}

// Calculate results for Executive elections
export async function calculateExecutiveResults(electionId: string) {
  try {
    // 1. Get election details
    const { data: election } = await supabase
      .from("elections")
      .select("*, election_type:election_types(*)")
      .eq("id", electionId)
      .single()

    if (!election || election.election_type.name !== "EXECUTIVE") {
      throw new Error("Not an executive election")
    }

    // 2. Get all positions for this election type
    const { data: positions } = await supabase
      .from("positions")
      .select("*")
      .eq("election_type_id", election.election_type_id)

    if (!positions) {
      throw new Error("No positions found")
    }

    // 3. Get all departments
    const { data: departments } = await supabase.from("departments").select("*")

    if (!departments) {
      throw new Error("No departments found")
    }

    // Process each position
    for (const position of positions) {
      // Get candidates for this position in this election
      const { data: candidates } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", electionId)
        .eq("position_id", position.id)

      if (!candidates || candidates.length === 0) continue

      // Process each candidate
      for (const candidate of candidates) {
        // Process each department
        for (const department of departments) {
          // Count eligible voters in this department
          const { count: eligibleVoters } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("department_id", department.id)
            .eq("role", "voter")

          // Count votes for this candidate from this department
          const { count: departmentVotes } = await supabase
            .from("votes")
            .select("*", { count: "exact", head: true })
            .eq("election_id", electionId)
            .eq("position_id", position.id)
            .eq("candidate_id", candidate.id)
            .eq("department_id", department.id)

          // Calculate percentage
          const percentage = eligibleVoters > 0 ? (departmentVotes / eligibleVoters) * 100 : 0

          // Store result
          await supabase.from("election_results").upsert([
            {
              election_id: electionId,
              position_id: position.id,
              candidate_id: candidate.id,
              department_id: department.id,
              total_votes: departmentVotes,
              department_votes: departmentVotes,
              department_eligible_voters: eligibleVoters,
              department_percentage: percentage,
              is_winner: false,
            },
          ])
        }
      }

      // Determine winner for this position
      // Get all results for this position
      const { data: results } = await supabase
        .from("election_results")
        .select("*")
        .eq("election_id", electionId)
        .eq("position_id", position.id)

      if (!results) continue

      // Group by candidate and count departments where they have highest percentage
      const candidateWins: Record<string, number> = {}
      const departmentWinners: Record<string, string> = {}

      for (const department of departments) {
        // Find candidate with highest percentage in this department
        let highestPercentage = 0
        let winningCandidateId = null

        for (const result of results.filter((r) => r.department_id === department.id)) {
          if (result.department_percentage > highestPercentage) {
            highestPercentage = result.department_percentage
            winningCandidateId = result.candidate_id
          }
        }

        if (winningCandidateId) {
          departmentWinners[department.id] = winningCandidateId
          candidateWins[winningCandidateId] = (candidateWins[winningCandidateId] || 0) + 1
        }
      }

      // Find candidate with most department wins
      let maxWins = 0
      let overallWinner = null

      for (const [candidateId, wins] of Object.entries(candidateWins)) {
        if (wins > maxWins) {
          maxWins = wins
          overallWinner = candidateId
        }
      }

      // Update winner
      if (overallWinner) {
        await supabase
          .from("election_results")
          .update({ is_winner: true })
          .eq("election_id", electionId)
          .eq("position_id", position.id)
          .eq("candidate_id", overallWinner)
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error calculating executive results:", error)
    return { success: false, error: error.message }
  }
}

// Calculate results for other election types (LG OFFICERS, PSITS)
export async function calculateStandardResults(electionId: string) {
  try {
    // 1. Get election details
    const { data: election } = await supabase
      .from("elections")
      .select("*, election_type:election_types(*)")
      .eq("id", electionId)
      .single()

    if (!election) {
      throw new Error("Election not found")
    }

    // 2. Get all positions for this election type
    const { data: positions } = await supabase
      .from("positions")
      .select("*")
      .eq("election_type_id", election.election_type_id)

    if (!positions) {
      throw new Error("No positions found")
    }

    // Process each position
    for (const position of positions) {
      // Get candidates for this position in this election
      const { data: candidates } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", electionId)
        .eq("position_id", position.id)

      if (!candidates || candidates.length === 0) continue

      // Count votes for each candidate
      for (const candidate of candidates) {
        const { count: totalVotes } = await supabase
          .from("votes")
          .select("*", { count: "exact", head: true })
          .eq("election_id", electionId)
          .eq("position_id", position.id)
          .eq("candidate_id", candidate.id)

        // Store result
        await supabase.from("election_results").upsert([
          {
            election_id: electionId,
            position_id: position.id,
            candidate_id: candidate.id,
            total_votes: totalVotes,
            is_winner: false,
          },
        ])
      }

      // Determine winner
      const { data: results } = await supabase
        .from("election_results")
        .select("*")
        .eq("election_id", electionId)
        .eq("position_id", position.id)
        .order("total_votes", { ascending: false })

      if (results && results.length > 0) {
        // Update winner (candidate with most votes)
        await supabase.from("election_results").update({ is_winner: true }).eq("id", results[0].id)
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error calculating standard results:", error)
    return { success: false, error: error.message }
  }
}
