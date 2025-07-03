import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { supabase } from "@/lib/supabase"
import CreateElectionPageClient from "./client"

export default async function CreateElectionPage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin and staff can access this page
  if (session.role !== "admin" && session.role !== "staff") {
    redirect("/dashboard")
  }

  // Get election types and departments for the dropdowns
  const [{ data: electionTypes }, { data: departments }] = await Promise.all([
    supabase.from("election_types").select("id,name").order("name", { ascending: true }),
    supabase.from("departments").select("id,name").order("name", { ascending: true }),
  ])

  return (
    <CreateElectionPageClient session={session} electionTypes={electionTypes || []} departments={departments || []} />
  )
}
