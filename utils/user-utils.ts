import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

/**
 * Hashes a password using bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate a salt and hash the password
    // The number 10 is the salt rounds (work factor)
    return await bcrypt.hash(password, 10)
  } catch (error) {
    console.error("Error hashing password:", error)
    throw new Error("Password hashing failed")
  }
}

/**
 * Verifies a password against a hash
 * @param password The plain text password to verify
 * @param hash The hash to verify against
 * @returns Whether the password matches the hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Check if the hash is a valid bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (!hash.match(/^\$2[aby]\$/)) {
      console.warn("Invalid bcrypt hash format, falling back to direct comparison")
      return password === hash
    }

    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error("Error verifying password:", error)
    // If bcrypt comparison fails, try direct comparison as fallback
    return password === hash
  }
}

/**
 * Migrates plaintext or improperly hashed passwords to proper bcrypt hashes
 * This would be used as a one-time migration function
 */
export async function migrateUserPasswords() {
  const { data: users, error } = await supabase.from("public.users").select("id, password_hash")

  if (error) {
    console.error("Error fetching users for password migration:", error)
    return { success: false, error: error.message }
  }

  const migratedUsers = []
  const failedUsers = []

  for (const user of users) {
    try {
      // Check if the password_hash is already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      if (user.password_hash && !user.password_hash.match(/^\$2[aby]\$/)) {
        // This assumes the current password_hash is plaintext or using a different hashing algorithm
        // In real migration scenarios, you might need a temporary password or a password reset flow
        const hashedPassword = await hashPassword(user.password_hash)

        // Update the user with the new bcrypt hash
        const { error: updateError } = await supabase
          .from("public.users")
          .update({
            password_hash: hashedPassword,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (updateError) {
          failedUsers.push({ id: user.id, error: updateError.message })
        } else {
          migratedUsers.push(user.id)
        }
      }
    } catch (err) {
      failedUsers.push({ id: user.id, error: err.message })
    }
  }

  return {
    success: true,
    migratedCount: migratedUsers.length,
    failedCount: failedUsers.length,
    failedUsers,
  }
}
