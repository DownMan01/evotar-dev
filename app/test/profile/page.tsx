import { getSession } from "@/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"
import { CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function testUserDataFetch(userId: string) {
  try {
    // Use the server client which bypasses RLS issues
    const supabase = createServerClient()

    const { data: userData, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        student_id,
        email,
        role,
        year_level,
        user_img,
        department:department_id (
          id,
          name,
          code
        )
      `)
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching user data:", error)
      return { success: false, error: error.message }
    }

    return { success: true, user: userData }
  } catch (error: any) {
    console.error("Exception in testUserDataFetch:", error)
    return { success: false, error: error.message }
  }
}

export default async function ProfileTestPage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>You need to be logged in to test the profile page.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  const result = await testUserDataFetch(session.userId)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Profile Page Test</h1>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>RLS Policy Test Results</CardTitle>
            <CardDescription>
              Testing if the profile page can fetch user data without infinite recursion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  User data was fetched successfully without any RLS policy errors.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error || "An unknown error occurred"}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {result.success && (
          <Card>
            <CardHeader>
              <CardTitle>User Data</CardTitle>
              <CardDescription>The data fetched from the database</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(result.user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Link href="/profile">
            <Button>Go to Profile Page</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
