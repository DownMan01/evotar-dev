"use server"

import { getSession } from "@/actions/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateElection(formData: FormData) {
  const session = await getSession()

  if (!session?.isLoggedIn || (session.role !== "admin" && session.role !== "staff")) {
    return { success: false, error: "Unauthorized" }
  }

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const electionTypeId = formData.get("electionType") as string
  const departmentId = formData.get("department") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const status = formData.get("status") as string
  const showResults = formData.get("showResults") === "on"

  if (!title || !electionTypeId || !startDate || !endDate || !status) {
    return { success: false, error: "All required fields must be filled" }
  }

  try {
    const { error } = await supabase
      .from("elections")
      .update({
        title,
        description,
        election_type_id: electionTypeId,
        department_id: departmentId === "none" ? null : departmentId,
        start_date: startDate,
        end_date: endDate,
        status,
        show_results: showResults,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating election:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the elections pages
    revalidatePath("/elections")
    revalidatePath(`/elections/${id}`)

    // Return success instead of redirecting
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateElection:", error)
    return { success: false, error: error.message }
  }
}
