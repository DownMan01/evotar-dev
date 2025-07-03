import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserIcon } from "lucide-react"
import type { Election, Candidate, Position } from "@/lib/supabase"

interface CandidatesListProps {
  election: Election
  candidates: Candidate[]
}

export function CandidatesList({ election, candidates }: CandidatesListProps) {
  // Group candidates by position
  const positionsMap = new Map<string, { position: Position; candidates: Candidate[] }>()

  candidates.forEach((candidate) => {
    const positionId = candidate.position.id
    if (!positionsMap.has(positionId)) {
      positionsMap.set(positionId, {
        position: candidate.position,
        candidates: [],
      })
    }
    positionsMap.get(positionId)?.candidates.push(candidate)
  })

  // Convert map to array and sort by position display order
  const positions = Array.from(positionsMap.values()).sort((a, b) => {
    return a.position.display_order - b.position.display_order
  })

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Candidates</CardTitle>
          <CardDescription>There are no candidates registered for this election yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Tabs defaultValue={positions[0]?.position.id} className="w-full">
      <TabsList className="mb-6 flex flex-wrap h-auto p-1">
        {positions.map(({ position }) => (
          <TabsTrigger key={position.id} value={position.id} className="mb-1">
            {position.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {positions.map(({ position, candidates }) => (
        <TabsContent key={position.id} value={position.id} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline">{candidate.position.name}</Badge>
          {candidate.department && (
            <Badge variant="secondary" className="ml-2">
              {candidate.department.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {candidate.user?.profile_url ? (
              <Image
                src={candidate.user.profile_url || "/placeholder.svg"}
                alt={candidate.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, 80px"
              />
            ) : (
              <UserIcon className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{candidate.name}</h3>
            <p className="text-sm text-muted-foreground">{candidate.user?.student_id || "No ID available"}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {candidate.info && (
            <div>
              <h4 className="text-sm font-medium">About</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{candidate.info}</p>
            </div>
          )}

          {/* Party affiliation - if we had this data */}
          {candidate.party && (
            <div>
              <h4 className="text-sm font-medium">Party</h4>
              <p className="text-sm text-muted-foreground">{candidate.party}</p>
            </div>
          )}

          {/* Additional candidate details could be added here */}
        </div>
      </CardContent>
    </Card>
  )
}
