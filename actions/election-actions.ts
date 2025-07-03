"use server"

import { supabase } from "@/lib/supabase"
import { getSession } from "@/actions/auth"
import { logSystemEvent } from "@/utils/system-logs"

export type ElectionFormData = {
  title: string
  description: string
  election_type_id: string
  department_id: string | null
  start_date: string
  end_date: string
  show_results: boolean
}

export async function createElection(data: ElectionFormData) {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn) {
      return { success: false, error: "You must be logged in to create an election" }
    }

    if (session.role !== "admin" && session.role !== "staff") {
      return { success: false, error: "You don't have permission to create elections" }
    }

    // Validate the data
    if (!data.title) {
      return { success: false, error: "Title is required" }
    }

    if (!data.election_type_id) {
      return { success: false, error: "Election type is required" }
    }

    if (!data.start_date) {
      return { success: false, error: "Start date is required" }
    }

    if (!data.end_date) {
      return { success: false, error: "End date is required" }
    }

    // Check if end date is after start date
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      return { success: false, error: "End date must be after start date" }
    }

    // Insert the election into the database
    const { data: election, error } = await supabase
      .from("elections")
      .insert({
        title: data.title,
        description: data.description,
        election_type_id: data.election_type_id,
        department_id: data.department_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: "draft", // Default status for new elections
        show_results: data.show_results,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating election:", error)
      return { success: false, error: error.message }
    }

    // Log the event
    await logSystemEvent({
      event_type: "ELECTION_CREATED",
      user_id: session.user.id,
      details: `Created election: ${data.title}`,
      related_id: election.id,
    })

    return { success: true, data: election }
  } catch (error: any) {
    console.error("Error in createElection:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function getElectionTypes() {
  try {
    const { data, error } = await supabase.from("election_types").select("id, name").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching election types:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getElectionTypes:", error)
    return []
  }
}

export async function getDepartments() {
  try {
    const { data, error } = await supabase.from("departments").select("id, name").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching departments:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getDepartments:", error)
    return []
  }
}
