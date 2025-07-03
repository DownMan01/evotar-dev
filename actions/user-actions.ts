"use server"

import { createClient } from "@supabase/supabase-js"
import { getSession } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { logSystemEvent } from "@/utils/system-logs"

// Create Supabase admin client for database operations
function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function deleteUser(userId: string) {
  try {
    const { supabase } = await import("@/lib/supabase")

    // Start a transaction to ensure all operations succeed or fail together
    // First, check for any constraints that would prevent deletion

    // Check for elections created by this user
    const { data: electionsData } = await supabase.from("elections").select("id").eq("created_by", userId)

    if (electionsData && electionsData.length > 0) {
      return {
        success: false,
        message: "Cannot delete user who has created elections. Please reassign or delete the elections first.",
      }
    }

    // Check for votes related to this user
    const { data: votesData } = await supabase.from("votes").select("id").eq("user_id", userId)

    if (votesData && votesData.length > 0) {
      return {
        success: false,
        message: "Cannot delete user with existing votes. This would compromise election integrity.",
      }
    }

    // Check for candidates related to this user
    const { data: candidatesData } = await supabase.from("candidates").select("id").eq("user_id", userId)

    if (candidatesData && candidatesData.length > 0) {
      return {
        success: false,
        message: "Cannot delete user who is a candidate in one or more elections.",
      }
    }

    // Instead of deleting system logs, update them to set user_id to null
    const { error: logsUpdateError } = await supabase
      .from("system_logs")
      .update({ user_id: null })
      .eq("user_id", userId)

    if (logsUpdateError) {
      console.error("Error updating system logs:", logsUpdateError)
      return { success: false, message: logsUpdateError.message || "Failed to update user's system logs" }
    }

    // Delete related records in user_wallets table
    const { error: walletError } = await supabase.from("user_wallets").delete().eq("user_id", userId)

    if (walletError) {
      console.error("Error deleting user wallet:", walletError)
      // Continue anyway as the user might not have a wallet
    }

    // Finally delete the user
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return { success: false, message: error.message || "Failed to delete user" }
    }

    return { success: true, message: "User deleted successfully" }
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return { success: false, message: error.message || "An error occurred while deleting the user" }
  }
}

export async function updateUser(userId: string, updates: any) {
  try {
    const session = await getSession()

    // Only admin can update users
    if (!session?.isLoggedIn || session.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = createSupabaseAdminClient()

    // Update the user
    const { error } = await supabaseAdmin.from("users").update(updates).eq("id", userId)

    if (error) {
      console.error("Error updating user:", error)
      return { success: false, error: error.message || "Failed to update user" }
    }

    // Log the user update
    await logSystemEvent({
      action: "User Updated",
      description: `User with ID ${userId} was updated by admin ${session.name}`,
      userId: session.userId,
    })

    // Revalidate the users page
    revalidatePath("/users")
    revalidatePath(`/users/${userId}/edit`)

    return { success: true }
  } catch (error: any) {
    console.error("Error in updateUser:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
