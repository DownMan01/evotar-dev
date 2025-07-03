"use client"

import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Election, ElectionResult } from "@/lib/supabase"

type ResultsListProps = {
  completedElections: Array<{
    election: Election
    results: ElectionResult[]
  }>
}

export default function ResultsList({ completedElections }: ResultsListProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  const getWinnerName = (election: any, results: ElectionResult[]) => {
    const winnerResult = results.find((result) => result.is_winner)
    return winnerResult?.candidate_name || "No winner determined"
  }

  const calculatePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0
  }

  const getTotalVotes = (results: ElectionResult[]) => {
    return results.reduce((sum, result) => sum + result.total_votes, 0)
  }

  return (
    <div className="space-y-6">
      {completedElections.map((item, i) => {
        const { election, results } = item
        const totalVotes = getTotalVotes(results)
        const winnerResult = results.find((result) => result.is_winner)

        return (
          <motion.div
            key={election.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card
              className={`overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow ${isMobile ? "rounded-xl" : ""}`}
            >
              <CardHeader className={`pb-3 ${isMobile ? "px-4 py-3" : ""}`}>
                <div className="flex justify-between items-start">
                  <CardTitle className={isMobile ? "text-lg" : "text-xl"}>{election.title}</CardTitle>
                  <Badge variant="secondary">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
                <CardDescription className={isMobile ? "text-sm line-clamp-2" : ""}>
                  {election.description}
                </CardDescription>
              </CardHeader>
              <CardContent className={`pb-3 ${isMobile ? "px-4 py-2" : ""}`}>
                {!isMobile && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Election Period</span>
                      <span className="text-sm font-medium">
                        {new Date(election.start_date).toLocaleDateString()} -{" "}
                        {new Date(election.end_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Total Votes</span>
                      <span className="text-sm font-medium">{totalVotes}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Winner</span>
                      <span className="text-sm font-medium">{getWinnerName(election, results)}</span>
                    </div>
                  </div>
                )}

                {isMobile && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Total Votes</span>
                      <span className="text-sm font-medium">{totalVotes}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Winner</span>
                      <span className="text-sm font-medium">{getWinnerName(election, results)}</span>
                    </div>
                  </div>
                )}

                {isMobile && winnerResult && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Top Result:</span>
                      <span className="font-medium">{winnerResult.candidate_name}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-green-500"
                        style={{
                          width: `${calculatePercentage(winnerResult.total_votes, totalVotes)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter
                className={`pt-3 border-t border-border/30 flex justify-between items-center ${isMobile ? "px-4 py-3" : ""}`}
              >
                <div className="text-xs text-muted-foreground flex items-center">
                  <span className="font-mono mr-1">Verified:</span>
                  <span className="font-mono truncate max-w-[120px]">
                    {results.length > 0 && results[0].block_hash
                      ? results[0].block_hash.substring(0, 8) + "..."
                      : "Pending"}
                  </span>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/results/${election.id}`}>
                    View Details
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )
      })}

      {completedElections.length === 0 && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No completed elections found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
