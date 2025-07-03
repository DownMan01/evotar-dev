import { CardDescription } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/actions/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { logSystemEvent } from "@/utils/system-logs"
// import { VoterLayout } from "@/components/layouts/voter-layout"

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic"

// Update the getCompletedElections function to include a delay for testing if needed
async function getCompletedElections() {
  try {
    // Get all completed elections
    const { data: elections, error: electionsError } = await supabase
      .from("elections")
      .select(`
        id, 
        title, 
        description, 
        status, 
        start_date,
        end_date,
        show_results,
        election_type:election_type_id(id, name),
        department:department_id(id, name)
      `)
      .eq("status", "completed")
      .order("end_date", { ascending: false })

    if (electionsError) {
      console.error("Error fetching completed elections:", electionsError)
      await logSystemEvent("ERROR", "Failed to fetch completed elections", electionsError.message)
      return []
    }

    // Process each election to get its results
    const processedElections = await Promise.all(
      elections.map(async (election) => {
        // Get candidates for this election
        const { data: candidates, error: candidatesError } = await supabase
          .from("candidates")
          .select("id, name, position_id")
          .eq("election_id", election.id)

        if (candidatesError) {
          console.error(`Error fetching candidates for election ${election.id}:`, candidatesError)
          await logSystemEvent(
            "ERROR",
            `Failed to fetch candidates for election ${election.id}`,
            candidatesError.message,
          )
          return { ...election, results: [], totalVotes: 0 }
        }

        // Get results for this election
        const { data: results, error: resultsError } = await supabase
          .from("election_results")
          .select("id, candidate_id, total_votes, is_winner")
          .eq("election_id", election.id)

        if (resultsError) {
          console.error(`Error fetching results for election ${election.id}:`, resultsError)
          await logSystemEvent("ERROR", `Failed to fetch results for election ${election.id}`, resultsError.message)
          return { ...election, results: [], totalVotes: 0 }
        }

        // Map candidate names to results
        const processedResults = results.map((result) => {
          const candidate = candidates.find((c) => c.id === result.candidate_id)
          return {
            ...result,
            candidateName: candidate ? candidate.name : "Unknown Candidate",
          }
        })

        // Calculate total votes
        const totalVotes = processedResults.reduce((sum, result) => sum + result.total_votes, 0)

        return {
          ...election,
          results: processedResults,
          totalVotes,
          candidates,
        }
      }),
    )

    return processedElections
  } catch (error: any) {
    console.error("Error in getCompletedElections:", error)
    await logSystemEvent("ERROR", "Exception in getCompletedElections", error.message)
    return []
  }
}

export default async function ResultsPage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Fetch completed elections
  const completedElections = await getCompletedElections()

  // If user is a voter, use the voter layout
  if (session.role === "voter") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Election Results</h1>
        <p className="text-white/90">
          View the results of completed elections. All results are verified and recorded on the blockchain.
        </p>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-white/20 text-white">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-[#0077ff]">
              All Results
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:text-[#0077ff]">
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {completedElections.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500">No completed elections found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedElections.map((election) => (
                  <Card key={election.id} className="bg-white overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{election.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{election.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="text-sm">
                          <span className="font-medium">Election Type:</span>{" "}
                          <span className="text-gray-600">{election.election_type?.name || "General"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">End Date:</span>{" "}
                          <span className="text-gray-600">{new Date(election.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Total Votes:</span>{" "}
                          <span className="text-gray-600">{election.totalVotes}</span>
                        </div>
                        {election.results.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Winner:</span>{" "}
                            <span className="text-green-600 font-medium">
                              {election.results.find((r) => r.is_winner)?.candidateName || "No winner determined"}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button asChild className="w-full">
                        <Link href={`/results/${election.id}`}>View Detailed Results</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedElections.slice(0, 3).map((election) => (
                <Card key={election.id} className="bg-white overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{election.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{election.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="font-medium">Election Type:</span>{" "}
                        <span className="text-gray-600">{election.election_type?.name || "General"}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">End Date:</span>{" "}
                        <span className="text-gray-600">{new Date(election.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Total Votes:</span>{" "}
                        <span className="text-gray-600">{election.totalVotes}</span>
                      </div>
                      {election.results.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Winner:</span>{" "}
                          <span className="text-green-600 font-medium">
                            {election.results.find((r) => r.is_winner)?.candidateName || "No winner determined"}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/results/${election.id}`}>View Detailed Results</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // For admin and staff, use the original layout
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Election Results</h1>
        <p className="text-muted-foreground mt-2">
          View the results of completed elections. All results are verified and recorded on the blockchain.
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {completedElections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No completed elections found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedElections.map((election) => (
                <Card key={election.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>{election.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Election Type:</span>{" "}
                        <span className="text-muted-foreground">{election.election_type?.name || "General"}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">End Date:</span>{" "}
                        <span className="text-muted-foreground">
                          {new Date(election.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Total Votes:</span>{" "}
                        <span className="text-muted-foreground">{election.totalVotes}</span>
                      </div>
                      {election.results.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Winner:</span>{" "}
                          <span className="text-green-600">
                            {election.results.find((r) => r.is_winner)?.candidateName || "No winner determined"}
                          </span>
                        </div>
                      )}
                      <div className="pt-3">
                        <Button asChild className="w-full">
                          <Link href={`/results/${election.id}`}>View Detailed Results</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="recent" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedElections.slice(0, 3).map((election) => (
              <Card key={election.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{election.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{election.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Election Type:</span>{" "}
                      <span className="text-muted-foreground">{election.election_type?.name || "General"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">End Date:</span>{" "}
                      <span className="text-muted-foreground">{new Date(election.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Total Votes:</span>{" "}
                      <span className="text-muted-foreground">{election.totalVotes}</span>
                    </div>
                    {election.results.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Winner:</span>{" "}
                        <span className="text-green-600">
                          {election.results.find((r) => r.is_winner)?.candidateName || "No winner determined"}
                        </span>
                      </div>
                    )}
                    <div className="pt-3">
                      <Button asChild className="w-full">
                        <Link href={`/results/${election.id}`}>View Detailed Results</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
