import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export const dynamic = "force-dynamic"

async function getCandidates() {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        id,
        name,
        info,
        user_id,
        position:positions(id, name),
        department:departments(id, name),
        election:elections(id, title, status)
      `)
      .eq("election.status", "active")
      .order("name")

    if (error) {
      console.error("Error fetching candidates:", error)
      return []
    }

    // For each candidate, fetch the user information separately
    const candidatesWithUserInfo = await Promise.all(
      data.map(async (candidate) => {
        if (candidate.user_id) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, student_id, user_img")
            .eq("id", candidate.user_id)
            .single()

          if (userError) {
            console.error(`Error fetching user for candidate ${candidate.id}:`, userError)
            return { ...candidate, user: null }
          }

          return { ...candidate, user: userData }
        }
        return { ...candidate, user: null }
      }),
    )

    return candidatesWithUserInfo || []
  } catch (error) {
    console.error("Error in getCandidates:", error)
    return []
  }
}

export default async function CandidatesPage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  const candidates = await getCandidates()

  // Group candidates by position
  const positionsMap = new Map()

  candidates.forEach((candidate) => {
    const positionName = candidate.position?.name || "Unknown Position"
    if (!positionsMap.has(positionName)) {
      positionsMap.set(positionName, [])
    }
    positionsMap.get(positionName).push(candidate)
  })

  // Convert map to array
  const positions = Array.from(positionsMap.entries()).map(([name, candidates]) => ({
    name,
    candidates,
  }))

  // If user is a voter, use the voter layout
  if (session.role === "voter") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Candidates</h1>
        <p className="text-white/90">View all candidates for active elections</p>

        {positions.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">No candidates found for active elections.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {positions.map((position) => (
              <div key={position.name} className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{position.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {position.candidates.map((candidate) => (
                    <Card key={candidate.id} className="bg-white overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {candidate.user?.user_img ? (
                              <Image
                                src={candidate.user.user_img || "/placeholder.svg"}
                                alt={candidate.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="text-xl font-bold text-gray-400">
                                {candidate.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{candidate.name}</h3>
                            <p className="text-sm text-gray-500">{candidate.department?.name || "No Department"}</p>
                          </div>
                        </div>

                        {candidate.info && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">About</h4>
                            <p className="text-sm text-gray-600">{candidate.info}</p>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-500">
                            Election: {candidate.election?.title || "Unknown Election"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // For admin and staff, return a simple message to implement their view
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
      <p className="text-muted-foreground">Admin/Staff view not implemented yet.</p>
    </div>
  )
}
