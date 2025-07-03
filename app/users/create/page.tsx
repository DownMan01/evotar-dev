import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { supabase } from "@/lib/supabase"
import CreateUserPageClient from "./client"

export default async function CreateUserPage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin can access this page
  if (session.role !== "admin") {
    redirect("/dashboard")
  }

  // Get departments for the dropdown
  const { data: departments, error } = await supabase
    .from("departments")
    .select("id,name")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching departments:", error)
  }

  return <CreateUserPageClient session={session} departments={departments || []} />
}
