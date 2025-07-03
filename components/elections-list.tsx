"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, CheckCircle, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

interface ElectionsListProps {
  filter: "all" | "active" | "upcoming" | "completed"
  user?: {
    role?: string
  }
}

export default function ElectionsList({ filter, user }: ElectionsListProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [elections, setElections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Mark component as mounted
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

  useEffect(() => {
    // Only fetch data on the client side
    if (!isMounted) return

    async function fetchElections() {
      try {
        setLoading(true)
        let query = supabase.from("elections").select(`
          id, 
          title, 
          description, 
          status, 
          start_date,
          end_date,
          election_type:election_types(name),
          votes:votes(id)
        `)

        // Apply filter
        if (filter !== "all") {
          query = query.eq("status", filter)
        }

        const { data, error: fetchError } = await query.order("end_date", { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        // Process the data to include vote counts
        const processedData =
          data?.map((election) => ({
            ...election,
            totalVotes: election.votes ? election.votes.length : 0,
          })) || []

        setElections(processedData)
      } catch (err: any) {
        console.error("Error fetching elections:", err)
        setError(err.message || "Failed to load elections")
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [filter, isMounted])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "upcoming":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Calendar className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className={isMobile ? "space-y-4" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-white p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-[80px] mb-1" />
                    <Skeleton className="h-5 w-[100px]" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-[80px] mb-1" />
                    <Skeleton className="h-5 w-[60px]" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 mt-6">
        <Card className="bg-white p-6">
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-gray-500">Error loading elections. Please try again later.</p>
          </div>
        </Card>
      </div>
    )
  }

  // Check if user is a voter to determine the styling
  const isVoter = user?.role === "voter"

  return (
    <div className="space-y-6 mt-6">
      {elections.length > 0 ? (
        <div className={isMobile ? "space-y-4" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
          {elections.map((election, i) => (
            <motion.div
              key={election.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className={`h-full ${isVoter ? "bg-white" : "bg-card/80 backdrop-blur-sm"} overflow-hidden`}>
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{election.title}</h3>
                    {getStatusBadge(election.status)}
                  </div>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{election.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-500">End Date</span>
                      <div className="text-sm font-medium">{new Date(election.end_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Votes</span>
                      <div className="text-sm font-medium">{election.totalVotes}</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t">
                    {election.status === "active" && (
                      <Button asChild className="w-full">
                        <Link href={`/elections/${election.id}`} className="flex items-center">
                          {user?.role === "admin" || user?.role === "staff" ? (
                            <>
                              More Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Vote Now
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Link>
                      </Button>
                    )}

                    {election.status === "completed" && (
                      <Button asChild variant="secondary" className="w-full">
                        <Link href={`/results/${election.id}`}>
                          View Results
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    {election.status === "upcoming" && (
                      <Button disabled className="w-full">
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className={isVoter ? "bg-white" : "bg-card/80 backdrop-blur-sm"}>
          <div className="flex flex-col items-center justify-center py-12">
            <p className={isVoter ? "text-gray-500" : "text-muted-foreground"}>
              No elections found matching your filter.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
