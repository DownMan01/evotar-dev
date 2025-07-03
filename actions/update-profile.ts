"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/actions/auth"
import { createClient } from "@/lib/supabase/server" // Import server-side Supabase client

export async function updateUserProfile(formData: FormData) {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn || !session.userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Extract form data
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const yearLevel = formData.get("yearLevel") as string
    const avatarUrl = formData.get("avatar_url") as string

    // Basic validation
    if (!fullName || !email) {
      return { success: false, error: "Name and email are required" }
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      name: fullName,
      email: email,
      year_level: yearLevel || null,
      updated_at: new Date().toISOString(),
    }

    // Add avatar URL if provided
    if (avatarUrl) {
      updateData.user_img = avatarUrl
    }

    // Use server-side Supabase client
    const supabaseAdmin = createClient()

    // Update the user in the database
    const { error } = await supabaseAdmin.from("users").update(updateData).eq("id", session.userId)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the profile page to reflect the changes
    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
