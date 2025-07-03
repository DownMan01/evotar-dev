import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ElectionsList from "@/components/elections-list"

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic"

export default async function ElectionsPage() {
  // Get the session
  const session = await getSession()

  // If not logged in, redirect to home page
  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // If user is a voter, use the voter layout
  if (session.role === "voter") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Elections</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-white/20 text-white">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-[#0077ff]">
              All
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-[#0077ff]">
              Active
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:text-[#0077ff]">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-[#0077ff]">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ElectionsList filter="all" user={session} />
          </TabsContent>

          <TabsContent value="active">
            <ElectionsList filter="active" user={session} />
          </TabsContent>

          <TabsContent value="upcoming">
            <ElectionsList filter="upcoming" user={session} />
          </TabsContent>

          <TabsContent value="completed">
            <ElectionsList filter="completed" user={session} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // For admin and staff, use the original layout
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Elections</h1>
        {(session.role === "admin" || session.role === "staff") && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/elections/create">Create New Election</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/elections/candidates/add">Add Candidate</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/results">Show Results</Link>
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ElectionsList filter="all" user={session} />
        </TabsContent>

        <TabsContent value="active">
          <ElectionsList filter="active" user={session} />
        </TabsContent>

        <TabsContent value="upcoming">
          <ElectionsList filter="upcoming" user={session} />
        </TabsContent>

        <TabsContent value="completed">
          <ElectionsList filter="completed" user={session} />
        </TabsContent>
      </Tabs>
    </>
  )
}
