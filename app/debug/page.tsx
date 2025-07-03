import { cookies } from "next/headers"
import { getSession } from "@/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DebugPage() {
  // Get all cookies
  const allCookies = cookies().getAll()

  // Get session
  const session = await getSession()

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Debug Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(
              {
                isLoggedIn: session?.isLoggedIn || false,
                role: session?.role || "none",
                userId: session?.userId || "none",
                name: session?.name || "none",
              },
              null,
              2,
            )}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(
              allCookies.map((c) => ({
                name: c.name,
                value: c.name === "session" ? "[REDACTED]" : c.value,
                path: c.path,
                expires: c.expires,
              })),
              null,
              2,
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
