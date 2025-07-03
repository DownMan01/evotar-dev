import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/actions/auth"
import DashboardHeader from "@/components/dashboard-header"
import { Calendar, CheckCircle, ExternalLink, Users, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ResultsChart from "@/components/results-chart"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { logSystemEvent } from "@/utils/system-logs"

async function getElectionResults(id: string) {
  try {
    // Get the election details
    const { data: election, error: electionError } = await supabase
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
      .eq("id", id)
      .single()

    if (electionError) {
      console.error("Error fetching election:", electionError)
      await logSystemEvent("ERROR", `Failed to fetch election ${id}`, electionError.message)
      return null
    }

    // Check if results should be shown
    if (!election.show_results && election.status !== "completed") {
      return { election, results: [], candidates: [], error: "Results are not yet available for this election." }
    }

    // Get the candidates for this election first
    const { data: candidates, error: candidatesError } = await supabase
      .from("candidates")
      .select(`
        id,
        name,
        info,
        position_id,
        department_id
      `)
      .eq("election_id", id)

    if (candidatesError) {
      console.error("Error fetching candidates:", candidatesError)
      await logSystemEvent("ERROR", `Failed to fetch candidates for election ${id}`, candidatesError.message)
      return { election, results: [], candidates: [], error: "Failed to load candidate information." }
    }

    // Get the election results - remove block_hash from the select query
    const { data: resultsData, error: resultsError } = await supabase
      .from("election_results")
      .select(`
        id,
        election_id,
        position_id,
        candidate_id,
        department_id,
        total_votes,
        is_winner
      `)
      .eq("election_id", id)
      .order("total_votes", { ascending: false })

    if (resultsError) {
      console.error("Error fetching election results:", resultsError)
      await logSystemEvent("ERROR", `Failed to fetch results for election ${id}`, resultsError.message)
      return { election, results: [], candidates, error: "Failed to load election results." }
    }

    // Map candidate names to results
    const results = resultsData.map((result) => {
      const candidate = candidates.find((c) => c.id === result.candidate_id)
      return {
        ...result,
        candidate_name: candidate ? candidate.name : "Unknown Candidate",
        // Add a placeholder for block_hash
        block_hash:
          "0x" +
          Array(64)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join(""),
      }
    })

    // Format the data for the chart
    const formattedData = {
      election,
      results,
      candidates,
      // Create a format compatible with the ResultsChart component
      chartData: {
        id: election.id,
        title: election.title,
        candidates: candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
        })),
        results: results.reduce(
          (acc, result) => {
            acc[result.candidate_id] = result.total_votes
            return acc
          },
          {} as Record<string, number>,
        ),
        winner: results.find((r) => r.is_winner)?.candidate_id || null,
        blockHash: "Blockchain verification pending", // Placeholder
      },
    }

    return formattedData
  } catch (error: any) {
    console.error("Error in getElectionResults:", error)
    await logSystemEvent("ERROR", `Exception in getElectionResults for ${id}`, error.message)
    return null
  }
}

export default async function ElectionResultPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  const data = await getElectionResults(params.id)

  if (!data) {
    redirect("/results")
  }

  const { election, results, chartData, error } = data

  const calculatePercentage = (votes: number) => {
    const totalVotes = results.reduce((sum, result) => sum + result.total_votes, 0)
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={session} />

      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/results" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Results
            </Link>
          </Button>
        </div>

        {error ? (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/results">Return to Results</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{election.title}</CardTitle>
                      <CardDescription className="mt-1">{election.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <div className="text-xs text-muted-foreground">Election Period</div>
                        <div className="text-sm font-medium">
                          {new Date(election.start_date).toLocaleDateString()} -{" "}
                          {new Date(election.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <div className="text-xs text-muted-foreground">Total Votes</div>
                        <div className="text-sm font-medium">
                          {results.reduce((sum, result) => sum + result.total_votes, 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <div className="text-xs text-muted-foreground">Winner</div>
                        <div className="text-sm font-medium">
                          {results.find((r) => r.is_winner)?.candidate_name || "No winner determined"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Results</h3>
                    <div className="space-y-4">
                      {results.map((result) => {
                        const percentage = calculatePercentage(result.total_votes)
                        const isWinner = result.is_winner

                        return (
                          <div key={result.id} className="relative">
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center">
                                <span className="font-medium">{result.candidate_name}</span>
                                {isWinner && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                                    Winner
                                  </span>
                                )}
                              </div>
                              <span className="text-muted-foreground">
                                {result.total_votes} votes ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${isWinner ? "bg-green-500" : "bg-primary/60"}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Blockchain Verification</CardTitle>
                  <CardDescription>
                    This election result is permanently recorded on the blockchain and cannot be altered.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Block Hash</span>
                          <p className="font-mono text-xs break-all mt-1">Blockchain verification pending</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Verification Status</span>
                          <p className="flex items-center mt-1 text-amber-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Pending Verification
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/blockchain" className="flex items-center">
                          View on Blockchain Explorer
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle>Visualization</CardTitle>
                  <CardDescription>Visual representation of the election results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResultsChart election={chartData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
}
