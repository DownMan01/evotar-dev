import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/actions/auth"
import { createClient } from "@supabase/supabase-js"
import EditUserForm from "@/components/edit-user-form"

export const dynamic = "force-dynamic"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin can access this page
  if (session.role !== "admin") {
    redirect("/dashboard")
  }

  const userId = params.id

  // Create a Supabase client with the service role key to bypass RLS policies
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Fetch the user data, bypassing RLS policies
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select(`
     id,
     created_at,
     updated_at,
     email,
     student_id,
     name,
     role,
     department_id,
     year_level,
     wallet_address,
     user_mnemonic,
     user_img
   `)
    .eq("id", userId)
    .single()

  if (userError || !userData) {
    console.error("Error fetching user:", userError)
    notFound()
  }

  // Fetch departments for the dropdown
  const { data: departments, error: departmentsError } = await supabaseAdmin
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true })

  if (departmentsError) {
    console.error("Error fetching departments:", departmentsError)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/users" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Users
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit User</h1>

        <Card className="bg-card/80 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Edit information for {userData.name}</CardDescription>
          </CardHeader>
          <EditUserForm user={userData} departments={departments || []} />
        </Card>
      </main>
    </div>
  )
}
