"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { logSystemEvent } from "@/utils/system-logs"

export type UserRole = "voter" | "staff" | "admin"

// Create Supabase client
function createSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Create Supabase admin client for user management
function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Simplified getSession function
export async function getSession() {
  try {
    // Check for session cookie first
    const sessionCookie = cookies().get("session")
    if (sessionCookie?.value) {
      try {
        const sessionData = JSON.parse(sessionCookie.value)
        if (sessionData && sessionData.isLoggedIn) {
          return sessionData
        }
      } catch (e) {
        console.error("Error parsing session cookie:", e)
      }
    }

    // No valid session cookie found
    return { isLoggedIn: false }
  } catch (error) {
    console.error("Error getting session:", error)
    return { isLoggedIn: false }
  }
}

// Database-based login function
export async function login(studentId: string, password: string) {
  try {
    const supabase = createSupabaseClient()

    console.log("Attempting login for student ID:", studentId)

    // Find user by student ID using the database function
    const { data: userData, error: userError } = await supabase.rpc("find_user_by_student_id", {
      p_student_id: studentId,
    })

    console.log("User lookup result:", { userData, userError })

    if (userError) {
      console.error("User lookup error:", userError)
      return { success: false, error: "Database error occurred" }
    }

    if (!userData || userData.length === 0) {
      console.log("No user found for student ID:", studentId)
      return { success: false, error: "Invalid student ID or password" }
    }

    const user = userData[0]
    console.log("Found user:", { id: user.id, name: user.name, role: user.role })

    // Verify password using the database function
    const { data: passwordValid, error: passwordError } = await supabase.rpc("verify_user_password", {
      p_user_id: user.id,
      p_password: password,
    })

    console.log("Password verification result:", { passwordValid, passwordError })

    if (passwordError) {
      console.error("Password verification error:", passwordError)
      return { success: false, error: "Authentication error occurred" }
    }

    if (!passwordValid) {
      console.log("Invalid password for user:", user.student_id)
      return { success: false, error: "Invalid student ID or password" }
    }

    // Create session data
    const sessionData = {
      isLoggedIn: true,
      id: user.id,
      userId: user.id,
      studentId: user.student_id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.department_id,
      walletAddress: user.wallet_address,
    }

    console.log("Creating session for user:", sessionData.name)

    // Set session cookie
    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "strict",
    })

    // Log the login event
    try {
      await logSystemEvent({
        action: "User Login",
        description: `User ${user.name} (${user.student_id}) logged in successfully`,
        userId: user.id,
      })
    } catch (logError) {
      console.warn("Failed to log login event:", logError)
    }

    console.log("Login successful for user:", user.name)
    return { success: true, role: user.role }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred during login" }
  }
}

// Simplified logout function
export async function logout() {
  try {
    const session = await getSession()

    // Log the logout event if we have a user ID
    if (session.userId) {
      try {
        await logSystemEvent({
          action: "User Logout",
          description: `User ${session.name} (${session.studentId}) logged out`,
          userId: session.userId,
        })
      } catch (logError) {
        console.warn("Failed to log logout event:", logError)
      }
    }

    cookies().delete("session")
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Fixed createUser function to work with database
export async function createUser(data: any) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()

    // Check for existing email
    const { data: existingEmail } = await supabaseAdmin.from("users").select("id").eq("email", data.email).maybeSingle()

    if (existingEmail) {
      return { success: false, error: "A user with this email already exists" }
    }

    // Check for existing student ID
    const { data: existingStudentId } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("student_id", data.student_id)
      .maybeSingle()

    if (existingStudentId) {
      return { success: false, error: "A user with this student ID already exists" }
    }

    // Hash the password
    const { data: hashedPassword, error: hashError } = await supabaseAdmin.rpc("crypt", {
      password: data.password,
      salt: await supabaseAdmin.rpc("gen_salt", { type: "bf" }),
    })

    if (hashError) {
      console.error("Error hashing password:", hashError)
      return { success: false, error: "Failed to process password" }
    }

    // Insert the user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        email: data.email,
        student_id: data.student_id,
        name: data.name,
        role: data.role,
        department_id: data.department_id || null,
        year_level: data.year_level || null,
        user_img: data.profile_image || null,
        password_hash: hashedPassword,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating user:", insertError)
      return { success: false, error: insertError.message || "Failed to create user" }
    }

    // Log the user creation
    await logSystemEvent({
      action: "User Created",
      description: `User ${data.name} (${data.student_id}) was created with role ${data.role}`,
      userId: newUser.id,
    })

    revalidatePath("/users")
    return { success: true, data: newUser }
  } catch (error: any) {
    console.error("Error in createUser:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function castVote(candidate: string) {
  // Placeholder function
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true, blockIndex: 1, blockHash: "0x123" }
}

export async function getBlockchain() {
  // Placeholder function
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      hash: "0x0",
      previousHash: "0x0",
    },
  ]
}

export async function updateUser(userId: string, updates: any) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()
    const { error } = await supabaseAdmin.from("users").update(updates).eq("id", userId)

    if (error) {
      console.error("Error updating user:", error)
      return { success: false, error: "Failed to update user" }
    }

    await logSystemEvent({
      action: "User Updated",
      description: `User with ID ${userId} was updated`,
      userId: userId,
    })

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Error in updateUser:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateElectionStatus(electionId: string, newStatus: string) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()
    const session = await getSession()

    const { error } = await supabaseAdmin.from("elections").update({ status: newStatus }).eq("id", electionId)

    if (error) {
      console.error("Error updating election status:", error)
      return { success: false, error: "Failed to update election status" }
    }

    await logSystemEvent({
      action: "Election Status Updated",
      description: `Election ${electionId} status changed to ${newStatus}`,
      userId: session.userId,
      metadata: { electionId, newStatus },
    })

    revalidatePath("/elections")
    return { success: true }
  } catch (error) {
    console.error("Error in updateElectionStatus:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function toggleResultVisibility(electionId: string, showResults: boolean) {
  try {
    const supabaseAdmin = createSupabaseAdminClient()
    const session = await getSession()

    const { error } = await supabaseAdmin.from("elections").update({ show_results: showResults }).eq("id", electionId)

    if (error) {
      console.error("Error toggling result visibility:", error)
      return { success: false, error: "Failed to toggle result visibility" }
    }

    await logSystemEvent({
      action: "Election Results Visibility Changed",
      description: `Election ${electionId} results visibility set to ${showResults ? "visible" : "hidden"}`,
      userId: session.userId,
      metadata: { electionId, showResults },
    })

    revalidatePath(`/results/${electionId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in toggleResultVisibility:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
