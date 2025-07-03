"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditUserError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Edit user error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">An error occurred while editing the user.</p>
          <p className="text-red-500 mb-6">{error?.message}</p>
          <div className="flex gap-4">
            <Button onClick={() => reset()}>Try Again</Button>
            <Button variant="outline" asChild>
              <Link href="/users">Back to Users</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
