"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"

export default function ElectionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Elections page error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Something went wrong" description="There was a problem loading the elections" />
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Please try again or contact support if the problem persists.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
