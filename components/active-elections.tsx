"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function ActiveElections() {
  const [elections, setElections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    async function fetchActiveElections() {
      try {
        setLoading(true)
        const { data, error } = await supabase
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
          .limit(5)

        if (error) {
          throw error
        }

        setElections(data || [])
      } catch (err: any) {
        console.error("Error fetching active elections:", err)
        setError(err.message || "Failed to load active elections")
      } finally {
        setLoading(false)
      }
    }

    fetchActiveElections()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className={`bg-card/80 backdrop-blur-sm ${isMobile ? "rounded-xl" : ""}`}>
            <CardHeader className={`${isMobile ? "px-4 py-3" : "p-6"}`}>
              <Skeleton className="h-6 w-[250px] mb-2" />
              <Skeleton className="h-4 w-[350px]" />
            </CardHeader>
            <CardContent className={`${isMobile ? "px-4 pb-3" : "px-6 pb-4"}`}>
              <Skeleton className="h-4 w-[200px] mb-2" />
            </CardContent>
            <CardFooter className={`flex justify-end border-t border-border/30 ${isMobile ? "px-4 py-3" : "p-6 pt-4"}`}>
              <Skeleton className="h-10 w-[120px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Error loading active elections. Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {elections.map((election) => (
        <Card key={election.id} className={`bg-card/80 backdrop-blur-sm ${isMobile ? "rounded-xl" : ""}`}>
          <CardHeader className={`${isMobile ? "px-4 py-3" : "p-6"}`}>
            <CardTitle className={isMobile ? "text-lg" : "text-xl"}>{election.title}</CardTitle>
            <CardDescription className={isMobile ? "text-sm line-clamp-2" : ""}>{election.description}</CardDescription>
          </CardHeader>

          <CardContent className={`${isMobile ? "px-4 pb-3" : "px-6 pb-4"}`}>
            <div className="text-sm text-muted-foreground">
              Ends on: {new Date(election.end_date).toLocaleDateString()}
            </div>
            {election.election_type && (
              <Badge variant="outline" className="mt-2">
                {election.election_type.name}
              </Badge>
            )}
          </CardContent>

          <CardFooter className={`flex justify-end border-t border-border/30 ${isMobile ? "px-4 py-3" : "p-6 pt-4"}`}>
            <Button asChild size={isMobile ? "sm" : "default"}>
              <Link href={`/elections/${election.id}`} className="flex items-center">
                Vote now
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}

      {elections.length === 0 && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No active elections at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
