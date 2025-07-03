import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import SystemLogsTable from "./system-logs-table"
import { setupLogsFunctions } from "@/actions/admin-actions"

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic"

export default async function SystemLogsPage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin can access this page
  if (session.role !== "admin") {
    redirect("/dashboard")
  }

  // Setup the logs functions
  await setupLogsFunctions()

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={session} />

      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6">System Logs</h1>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>View all system events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LogsTableSkeleton />}>
              <SystemLogsTable />
            </Suspense>
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

function LogsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-x-2 flex">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
      <div className="flex justify-between">
        <Skeleton className="h-9 w-20" />
        <div className="space-x-2 flex">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}
