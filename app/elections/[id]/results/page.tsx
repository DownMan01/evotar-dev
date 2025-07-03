import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"

export default async function ElectionResultsPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin can access this page
  if (session.role !== "admin") {
    redirect("/dashboard")
  }

  const electionId = params.id

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={session} />

      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/elections" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Elections
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Election Results</h1>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Results Management</CardTitle>
            <CardDescription>View and manage results for this election</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Results for election ID: {electionId}</p>
            <p className="text-muted-foreground mt-4">
              This is a placeholder for the election results management page.
            </p>
          </CardContent>
        </Card>
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
