import { redirect, notFound } from "next/navigation"
import { getSession } from "@/actions/auth"
import { supabase } from "@/lib/supabase"
import EditElectionPageClient from "./client"

export const dynamic = "force-dynamic"

export default async function EditElectionPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin and staff can access this page
  if (session.role !== "admin" && session.role !== "staff") {
    redirect("/dashboard")
  }

  const electionId = params.id

  // Fetch the election data
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select(`
     *,
     election_type:election_types(id, name),
     department:departments(id, name)
   `)
    .eq("id", electionId)
    .single()

  if (electionError || !election) {
    console.error("Error fetching election:", electionError)
    notFound()
  }

  // Fetch election types for the dropdown
  let electionTypes = []
  try {
    const { data, error } = await supabase.from("election_types").select("id, name").order("name", { ascending: true })

    if (error) throw error
    electionTypes = data || []
  } catch (error) {
    console.error("Error fetching election types:", error)
    // Provide a minimal fallback if we can't fetch election types
    electionTypes = [{ id: election.election_type_id, name: election.election_type?.name || "Current Type" }]
  }

  // Fetch departments for the dropdown
  let departments = []
  try {
    const { data, error } = await supabase.from("departments").select("id, name").order("name", { ascending: true })

    if (error) throw error
    departments = data || []
  } catch (error) {
    console.error("Error fetching departments:", error)
    // Provide a minimal fallback if we can't fetch departments
    if (election.department_id && election.department?.name) {
      departments = [{ id: election.department_id, name: election.department.name }]
    }
  }

  return <EditElectionPageClient election={election} electionTypes={electionTypes} departments={departments} />
}
