"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditElectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Edit election error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>An error occurred while editing the election.</p>
          <p className="text-red-500">{error?.message}</p>
          <Button onClick={() => reset()}>Try Again</Button>
          <Link href="/elections">
            <Button variant="secondary">Back to Elections</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
