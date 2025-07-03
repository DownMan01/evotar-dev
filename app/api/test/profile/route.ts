import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getSession } from "@/actions/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Get the current session
    const session = await getSession()

    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Use the server client which bypasses RLS issues
    const supabase = createServerClient()

    // Try to fetch the user data
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
      .eq("id", session.userId)
      .single()

    if (error) {
      console.error("Error fetching user data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return the user data
    return NextResponse.json({
      success: true,
      message: "User data fetched successfully",
      user: userData,
    })
  } catch (error: any) {
    console.error("Exception in profile test:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
