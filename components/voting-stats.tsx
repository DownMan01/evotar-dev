"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface VotingStatsProps {
  totalVoters: number
  totalVotersNotYetVoted: number
  systemHealth: "Healthy" | "Warning" | "Error" | "Unknown"
  isVisible?: boolean
}

async function getTotalVotersVoted(): Promise<number> {
  try {
    const response = await fetch("/api/stats/voters-voted")
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    console.log("getTotalVotersVoted API Response:", data) // Add logging here
    if (data.success && typeof data.count === "number") {
      return data.count
    } else {
      throw new Error(data.error || "Failed to fetch total voters voted")
    }
  } catch (error) {
    console.error("Error fetching total voters voted:", error)
    return 0 // Return 0 as a fallback
  }
}

async function getTotalVoterCount(): Promise<number> {
  try {
    const response = await fetch("/api/stats/voter-count")
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    console.log("getTotalVoterCount API Response:", data) // Add logging here
    if (data.success && typeof data.count === "number") {
      return data.count
    } else {
      throw new Error(data.error || "Failed to fetch total voter count")
    }
  } catch (error) {
    console.error("Error fetching total voter count:", error)
    return 0 // Return 0 as a fallback
  }
}

export function VotingStats({
  systemHealth,
  isVisible = true,
}: Omit<VotingStatsProps, "totalVoters" | "totalVotersNotYetVoted">) {
  const [voterCount, setVoterCount] = useState<number>(0)
  const [totalVotersVoted, setTotalVotersVoted] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [totalVoters, votersVoted] = await Promise.all([getTotalVoterCount(), getTotalVotersVoted()])

        setVoterCount(totalVoters)
        setTotalVotersVoted(votersVoted)
      } catch (err: any) {
        console.error("Error fetching voting stats:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalVotersNotYetVoted = voterCount - totalVotersVoted

  return isVisible ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-8">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <Skeleton className="h-10 w-16 mb-2" />
          ) : (
            <div className="text-3xl font-bold">{error ? "N/A" : voterCount}</div>
          )}
          <p className="text-sm text-muted-foreground">Total Voters</p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-10 w-16 mb-2" /> : totalVotersVoted}
          </div>
          <p className="text-sm text-muted-foreground">Voters Voted</p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-10 w-16" /> : Math.max(0, voterCount - totalVotersVoted)}
          </div>
          <p className="text-sm text-muted-foreground">Voters Not Yet Voted</p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-6">
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-1" />
          ) : (
            <div className="flex items-center gap-2 mb-1">
              {systemHealth === "Healthy" && (
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              )}
              {systemHealth === "Warning" && (
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              )}
              {systemHealth === "Error" && (
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              )}
              {systemHealth === "Unknown" && (
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-gray-600" />
                </div>
              )}
              <div
                className={`text-xl font-bold ${
                  systemHealth === "Error"
                    ? "text-red-600"
                    : systemHealth === "Warning"
                      ? "text-amber-600"
                      : systemHealth === "Healthy"
                        ? "text-green-600"
                        : "text-gray-600"
                }`}
              >
                {systemHealth}
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">System Health</p>
        </CardContent>
      </Card>
    </div>
  ) : null
}
