import { redirect, notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getSession } from "@/actions/auth"
import { logSystemEvent } from "@/utils/system-logs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileEdit, UserPlus, BarChart3 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ElectionPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/login")
  }

  // Handle special case for "create" - redirect to the dedicated create page
  if (params.id === "create") {
    redirect("/elections/create")
  }

  try {
    // Log page access
    await logSystemEvent({
      event_type: "PAGE_ACCESS",
      user_id: session.user?.id || session.id, // Use session.id as fallback
      details: `Accessed election page: ${params.id}`,
    })

    // Fetch the election details
    const { data: election, error: electionError } = await supabase
      .from("elections")
      .select(`
       id, 
       title, 
       description, 
       status, 
       end_date,
       show_results,
       election_type:election_type_id(id, name),
       department:department_id(id, name)
     `)
      .eq("id", params.id)
      .single()

    if (electionError || !election) {
      console.error("Error fetching election:", electionError)
      notFound()
    }

    // Format the end date
    const endDate = new Date(election.end_date)
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(endDate)

    // Check if the election has ended
    const hasEnded = endDate < new Date()

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/elections" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Elections
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{election.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{election.description}</CardDescription>
              </div>
              <Badge variant={election.status === "active" ? "default" : "secondary"}>{election.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <span className="font-medium">Election Type:</span> {election.election_type?.name}
            </div>
            <div className="text-sm">
              <span className="font-medium">Department:</span> {election.department?.name || "All"}
            </div>
            <div className="text-sm">
              <span className="font-medium">End Date:</span> {formattedDate}
            </div>
          </CardContent>
        </Card>

        {session.role === "admin" && (
          <div className="flex justify-end gap-4 mb-8">
            <Button asChild>
              <Link href={`/elections/${params.id}/candidates/add`}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Candidate
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/elections/${params.id}/edit`}>
                <FileEdit className="h-4 w-4 mr-2" />
                Edit Election
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/results/${params.id}`}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Show Results
              </Link>
            </Button>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Election page error:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-bold mb-2">Error Loading Election</h2>
            <p className="text-muted-foreground">There was a problem loading this election.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/elections">Back to Elections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
