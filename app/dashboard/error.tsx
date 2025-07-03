"use client"

import { useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Always initialize the router hook, regardless of conditions
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Alert className="bg-red-50 border-red-200">
        <AlertTitle className="text-red-800">Something went wrong!</AlertTitle>
        <AlertDescription className="text-red-700">
          We're having trouble loading the dashboard. This might be due to a connection issue or a temporary outage.
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex flex-col gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>

      {/* Only show error details in development */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md border border-gray-200">
          <p className="text-sm font-mono text-gray-800">{error.message}</p>
          {error.digest && <p className="text-xs font-mono text-gray-600 mt-2">Digest: {error.digest}</p>}
        </div>
      )}
    </div>
  )
}
