"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginFormProps {
  isLoggedIn?: boolean
}

export default function LoginForm({ isLoggedIn = false }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  // Handle redirect if user is already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard")
    }
  }, [isLoggedIn, router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("Form submitted with:", { studentId, password: "***" })

    if (!studentId.trim()) {
      setError("Please enter your student ID")
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError("Please enter your password")
      setIsLoading(false)
      return
    }

    try {
      console.log("Calling login function...")
      const result = await login(studentId.trim(), password)
      console.log("Login result:", result)

      if (result.success) {
        console.log("Login successful, redirecting to dashboard...")
        router.push("/dashboard")
        router.refresh()
      } else {
        console.log("Login failed:", result.error)
        setError(result.error || "Login failed. Please check your credentials.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Login exception:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // If we're already logged in and being redirected, show a loading state
  if (isLoggedIn) {
    return (
      <Card className="w-full max-w-lg border border-white/20 shadow-lg bg-white">
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <p className="mb-4">You are already logged in.</p>
            <p>Redirecting to dashboard...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg border border-white/20 shadow-lg bg-white">
      <CardHeader className="space-y-3 flex flex-col items-center text-center py-8">
        <CardTitle className="text-2xl font-semibold tracking-tight text-[#0077ff]">Vote Now!</CardTitle>
        <CardDescription className="text-base">Every vote matters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-8">
        {error && (
          <Alert variant="destructive" className="text-sm z-10">
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
              placeholder="Enter your student ID (e.g., CS-2021-001)"
              className="bg-background/50"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="bg-background/50 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-2">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-[#0077ff] transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-[#0077ff] hover:bg-[#0066dd] text-white">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center py-6">
        <Link href="/request-account" className="text-sm text-muted-foreground hover:text-[#0077ff] transition-colors">
          Request an account
        </Link>
      </CardFooter>
    </Card>
  )
}
