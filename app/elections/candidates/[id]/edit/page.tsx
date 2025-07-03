import { redirect, notFound } from "next/navigation"
import { getSession } from "@/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { supabase } from "@/lib/supabase"
import EditCandidateForm from "@/components/edit-candidate-form"

export const dynamic = "force-dynamic"

export default async function EditCandidatePage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin and staff can access this page
  if (session.role !== "admin" && session.role !== "staff") {
    redirect("/dashboard")
  }

  const candidateId = params.id

  // Fetch the candidate data
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select(`
      *,
      election:elections(id, title),
      position:positions(id, name),
      department:departments(id, name),
      user:users(id, name, student_id)
    `)
    .eq("id", candidateId)
    .single()

  if (candidateError || !candidate) {
    console.error("Error fetching candidate:", candidateError)
    notFound()
  }

  // Fetch positions for the dropdown
  const { data: positions, error: positionsError } = await supabase
    .from("positions")
    .select("id, name, election_type_id")
    .order("display_order", { ascending: true })

  if (positionsError) {
    console.error("Error fetching positions:", positionsError)
  }

  // Fetch departments for the dropdown
  const { data: departments, error: departmentsError } = await supabase
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true })

  if (departmentsError) {
    console.error("Error fetching departments:", departmentsError)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={session} />

      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/elections/${candidate.election_id}/candidates`}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Candidates
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Candidate</h1>
          <p className="text-muted-foreground mt-1">Update information for {candidate.name}</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
            <CardDescription>Edit the details for this candidate in {candidate.election?.title}</CardDescription>
          </CardHeader>
          <EditCandidateForm candidate={candidate} positions={positions || []} departments={departments || []} />
        </Card>
      </main>

      <footer className="py-6 border-t border-border/40 backdrop-blur-sm hidden md:block">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Evotar - Blockchain Voting Platform © {new Date().getFullYear()}</p>
          <p className="mt-1">Secure, Transparent, Immutable</p>
        </div>
      </footer>
    </div>
  )
}
