"use server"

import { supabase } from "@/lib/supabase"
import { getSession } from "@/actions/auth"
import { logSystemEvent } from "@/utils/system-logs"
import { revalidatePath } from "next/cache"

interface CandidateData {
  name: string
  student_id: string
  election_id: string
  position_id: string
  department_id?: string
  party?: string
  bio?: string
}

export async function addCandidate(data: CandidateData) {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn) {
      return { success: false, error: "You must be logged in to add a candidate" }
    }

    if (session.role !== "admin" && session.role !== "staff") {
      return { success: false, error: "You don't have permission to add candidates" }
    }

    // Validate required fields
    if (!data.name) {
      return { success: false, error: "Candidate name is required" }
    }

    if (!data.student_id) {
      return { success: false, error: "Student ID is required" }
    }

    if (!data.position_id) {
      return { success: false, error: "Position is required" }
    }

    // Check if a user with this student ID exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("student_id", data.student_id)
      .maybeSingle()

    if (userError) {
      console.error("Error checking existing user:", userError)
      return { success: false, error: "Error checking existing user" }
    }

    let userId = existingUser?.id

    // If no user exists with this student ID, create one
    if (!userId) {
      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          student_id: data.student_id,
          name: data.name,
          email: `${data.student_id.toLowerCase()}@example.com`, // Placeholder email
          role: "voter",
          department_id: data.department_id,
        })
        .select("id")
        .single()

      if (createUserError) {
        console.error("Error creating user for candidate:", createUserError)
        return { success: false, error: "Failed to create user for candidate" }
      }

      userId = newUser.id
    }

    // Insert the candidate
    const { data: candidate, error } = await supabase
      .from("candidates")
      .insert({
        name: data.name,
        election_id: data.election_id,
        position_id: data.position_id,
        department_id: data.department_id || null,
        party: data.party || null,
        info: data.bio || null,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding candidate:", error)
      return { success: false, error: error.message }
    }

    // Log the event
    await logSystemEvent({
      event_type: "CANDIDATE_ADDED",
      user_id: session.user.id,
      details: `Added candidate: ${data.name} for election ID: ${data.election_id}`,
      related_id: candidate.id,
    })

    // Revalidate the candidates page
    revalidatePath(`/elections/${data.election_id}/candidates`)

    return { success: true, data: candidate }
  } catch (error: any) {
    console.error("Error in addCandidate:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
