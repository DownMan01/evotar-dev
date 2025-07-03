import { redirect, notFound } from "next/navigation"
import { getSession } from "@/actions/auth"
import Link from "@/next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { supabase } from "@/lib/supabase"
import AddCandidateForm from "@/components/add-candidate-form"

export const dynamic = "force-dynamic"

export default async function AddCandidatePage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin and staff can access this page
  if (session.role !== "admin" && session.role !== "staff") {
    redirect("/dashboard")
  }

  const electionId = params.id

  // Fetch election details
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("id, title, election_type_id")
    .eq("id", electionId)
    .single()

  if (electionError || !election) {
    console.error("Error fetching election:", electionError)
    notFound()
  }

  // Fetch positions for the dropdown
  const { data: positions, error: positionsError } = await supabase
    .from("positions")
    .select("id, name")
    .eq("election_type_id", election.election_type_id)
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
              href={`/elections/${params.id}/candidates`}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Candidates
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Add Candidate</h1>
          <p className="text-muted-foreground mt-1">Add a new candidate to {election.title}</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
            <CardDescription>Enter the details of the new candidate</CardDescription>
          </CardHeader>
          <AddCandidateForm
            electionId={electionId}
            positions={positions || []}
            departments={departments || []}
            electionType={election.election_type_id}
          />
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
