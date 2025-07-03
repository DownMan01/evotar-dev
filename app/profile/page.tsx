import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileView } from "@/components/profile-view"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

async function getUserData(userId: string) {
  // Use the server client which bypasses RLS issues
  const supabase = createServerClient()

  try {
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
      return null
    }

    return userData
  } catch (error) {
    console.error("Exception in getUserData:", error)
    return null
  }
}

export default async function ProfilePage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  const userData = await getUserData(session.userId)

  const user = userData || {
    name: session.name,
    student_id: session.studentId,
    email: "",
    role: session.role,
    year_level: "",
    user_img: null,
    department: null,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Profile</h1>

      <div className="max-w-3xl mx-auto">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View and manage your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileView user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
