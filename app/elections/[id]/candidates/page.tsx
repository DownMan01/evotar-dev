import { getSession } from "@/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, UserPlus, FileEdit, Trash2 } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { getElection, getCandidates } from "@/services/database"
import { logSystemEvent } from "@/utils/system-logs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function ElectionCandidatesPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-6">Please log in to view this page</p>
        <Button asChild>
          <Link href="/">Log In</Link>
        </Button>
      </div>
    )
  }

  try {
    // Log page access
    if (session?.user?.id) {
      await logSystemEvent({
        event_type: "PAGE_ACCESS",
        component: "ElectionCandidatesPage",
        description: `User accessed election candidates page for election ID: ${params.id}`,
        user_id: session.user.id,
      })
    }

    // Fetch election details
    const election = await getElection(params.id)
    if (!election) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Election Not Found</h1>
          <p className="text-muted-foreground mb-6">The election you're looking for doesn't exist</p>
          <Button asChild>
            <Link href="/elections">Back to Elections</Link>
          </Button>
        </div>
      )
    }

    // Fetch candidates for this election
    const candidates = await getCandidates(params.id)

    // Group candidates by position
    const positionsMap = new Map()
    candidates.forEach((candidate) => {
      const positionName = candidate.position?.name || "Unknown Position"
      if (!positionsMap.has(positionName)) {
        positionsMap.set(positionName, [])
      }
      positionsMap.get(positionName).push(candidate)
    })

    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader user={session} />

        <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/elections/${params.id}`}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Election
              </Link>
            </Button>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
              <p className="text-muted-foreground mt-1">Manage candidates for {election.title}</p>
            </div>
            {(session.role === "admin" || session.role === "staff") && (
              <Button asChild>
                <Link href={`/elections/${params.id}/candidates/add`}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Candidate
                </Link>
              </Button>
            )}
          </div>

          {Array.from(positionsMap.entries()).map(([positionName, positionCandidates]) => (
            <Card key={positionName} className="bg-card/80 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle>{positionName}</CardTitle>
                <CardDescription>
                  {positionCandidates.length} candidate{positionCandidates.length !== 1 ? "s" : ""} running for this
                  position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Party</TableHead>
                      {(session.role === "admin" || session.role === "staff") && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positionCandidates.length > 0 ? (
                      positionCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={candidate.user?.profile_url || undefined} alt={candidate.name} />
                                <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{candidate.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.user?.student_id || "N/A"}</TableCell>
                          <TableCell>
                            {candidate.department ? (
                              <Badge variant="outline">{candidate.department.name}</Badge>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>{candidate.party || "Independent"}</TableCell>
                          {(session.role === "admin" || session.role === "staff") && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/elections/${params.id}/candidates/${candidate.id}/edit`}>
                                    <FileEdit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={session.role === "admin" || session.role === "staff" ? 5 : 4}
                          className="text-center py-8"
                        >
                          No candidates found for this position
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          {positionsMap.size === 0 && (
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>No Candidates</CardTitle>
                <CardDescription>There are no candidates registered for this election yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {session.role === "admin" || session.role === "staff"
                    ? "Click the 'Add Candidate' button to add candidates to this election."
                    : "Check back later for candidate information."}
                </p>
              </CardContent>
            </Card>
          )}
        </main>

        <footer className="py-6 border-t border-border/40 backdrop-blur-sm hidden md:block">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Evotar - Blockchain Voting Platform © {new Date().getFullYear()}</p>
            <p className="mt-1">Secure, Transparent, Immutable</p>
          </div>
        </footer>
      </div>
    )
  } catch (error) {
    console.error("Error in ElectionCandidatesPage:", error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">Failed to load election candidates. Please try again later.</p>
        <Button asChild>
          <Link href="/elections">Back to Elections</Link>
        </Button>
      </div>
    )
  }
}
