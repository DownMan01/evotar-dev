"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Vote, BarChart2, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

export default function VoterDashboard({ user }: { user: any }) {
  const router = useRouter()
  const [activeElections, setActiveElections] = useState<any[]>([])
  const [completedElections, setCompletedElections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isValidUser, setIsValidUser] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Extract first name for welcome message
  const firstName = user?.name?.split(" ")[0] || "Voter"

  useEffect(() => {
    if (!user || !user.id) {
      setIsValidUser(false)
      return
    }

    async function fetchElections() {
      setIsLoading(true)
      setFetchError(null) // Clear any previous errors
      try {
        const { data: activeData, error: activeError } = await supabase
          .from("elections")
          .select(`
            id, 
            title, 
            description, 
            status, 
            end_date,
            election_type:election_types(name)
          `)
          .eq("status", "active")
          .order("end_date", { ascending: true })
          .limit(3)

        if (activeError) throw activeError
        setActiveElections(activeData || [])

        // Fetch completed elections
        const { data: completedData, error: completedError } = await supabase
          .from("elections")
          .select(`
            id, 
            title, 
            description, 
            status, 
            end_date,
            election_type:election_types(name)
          `)
          .eq("status", "completed")
          .eq("show_results", true)
          .order("end_date", { ascending: false })
          .limit(3)

        if (completedError) throw completedError
        setCompletedElections(completedData || [])
      } catch (error: any) {
        console.error("Error fetching elections:", error)
        setFetchError(error.message || "Failed to load elections")
      } finally {
        setIsLoading(false)
        // Add a smooth transition when content loads
        setTimeout(() => {
          const contentElements = document.querySelectorAll(".election-content")
          contentElements.forEach((el) => {
            ;(el as HTMLElement).style.opacity = "1"
            ;(el as HTMLElement).style.transition = "opacity 0.3s ease-in-out"
          })
        }, 50)
      }
    }

    fetchElections()
  }, [user])

  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!isValidUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Session Error</h2>
          <p className="mb-6">Your session appears to be invalid. Please log in again.</p>
          <Button onClick={() => router.push("/")}>Go to Login</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-xl text-white/80">Welcome back, {firstName}!</p>
      </div>

      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/20 text-white p-4 rounded-lg">Error: {fetchError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Elections Card */}
        <Card className="bg-white/95 rounded-lg shadow-md overflow-hidden border border-white/10 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Vote className="h-5 w-5 mr-2 text-primary" />
              Active Elections
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
                <Skeleton className="h-9 w-full mt-4" />
              </div>
            ) : activeElections.length > 0 ? (
              <div className="space-y-3 election-content" style={{ opacity: 0 }}>
                {activeElections.map((election) => (
                  <Link
                    key={election.id}
                    href={`/elections/${election.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">{election.title}</div>
                    <div className="text-sm text-gray-500 mt-1">Ends: {formatDate(election.end_date)}</div>
                  </Link>
                ))}
                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-4 border-primary/20 text-primary hover:bg-primary/5"
                >
                  <Link href="/elections?filter=active">
                    <Vote className="h-4 w-4 mr-2" />
                    View All Active Elections
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-gray-100/50">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 font-medium">No active elections</p>
                <p className="text-gray-400 text-sm mt-1">Check back later for upcoming elections</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Results Card */}
        <Card className="bg-white/95 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Results</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
                <Skeleton className="h-9 w-full mt-2" />
              </div>
            ) : completedElections.length > 0 ? (
              <div className="space-y-3 election-content" style={{ opacity: 0 }}>
                {completedElections.map((election) => (
                  <Link
                    key={election.id}
                    href={`/results/${election.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">{election.title}</div>
                    <div className="text-sm text-gray-500 mt-1">Completed: {formatDate(election.end_date)}</div>
                  </Link>
                ))}
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link href="/results">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    View All Results
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart2 className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No results available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Elections Card */}
        <Card className="bg-white/95 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Elections</h3>
            <div className="text-center py-6">
              <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No upcoming elections</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Summary Card */}
      <Card className="bg-white/95 rounded-lg shadow-md overflow-hidden border border-white/10 backdrop-blur-sm col-span-1 lg:col-span-3">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-primary" />
            Voting Activity
          </h3>
          <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-4xl font-bold text-primary/20 mb-2">VOTER DASHBOARD</div>
            <p className="text-gray-500">Your voting activity will appear here</p>
          </div>
        </div>
      </Card>

      {/* Recent Activity Card */}
      <Card className="bg-white/95 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="text-center py-6">
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
