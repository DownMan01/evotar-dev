"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const studentId = formData.get("studentId") as string
    const password = formData.get("password") as string

    try {
      // First, find the user by student ID to get their email
      const { data: userData, error: userError } = await supabase.rpc("find_user_by_student_id", {
        p_student_id: studentId,
      })

      if (userError || !userData || userData.length === 0) {
        setError("Invalid student ID or password")
        setIsLoading(false)
        return
      }

      // Now sign in with the email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData[0].email,
        password: password,
      })

      if (signInError) {
        setError(signInError.message || "Login failed. Please check your credentials.")
        setIsLoading(false)
        return
      }

      // Refresh the page to update the session
      router.refresh()

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg border border-border shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-3 flex flex-col items-center text-center py-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary"
          >
            <path d="m18 6-6-4-6 4M4 8v10c0 1.1.9 2 2 2h2M20 8v10c0 1.1-.9 2-2 2h-2" />
            <path d="M15 13v5M9 13v5" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">VOTERS LOGIN</CardTitle>
        <CardDescription className="text-base">Welcome to evotar website</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-8">
        {error && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              name="studentId"
              type="text"
              required
              placeholder="Enter your student ID"
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="bg-background/50"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center py-6">
        <Link href="/request-account" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Request an account
        </Link>
      </CardFooter>
    </Card>
  )
}
