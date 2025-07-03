import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as fs from "fs"

// Load environment variables
dotenv.config({ path: ".env.local" })

// Initialize Supabase client with service role key
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function migrateUsers() {
  console.log("Starting user migration...")

  // Get all users from the old users table
  const { data: oldUsers, error: fetchError } = await supabase.from("users").select("*")

  if (fetchError) {
    console.error("Error fetching users:", fetchError)
    return
  }

  if (!oldUsers || oldUsers.length === 0) {
    console.log("No users found to migrate")
    return
  }

  console.log(`Found ${oldUsers.length} users to migrate`)

  // Create a log file
  const logStream = fs.createWriteStream("migration-log.txt", { flags: "a" })

  // Process each user
  for (const user of oldUsers) {
    try {
      // Skip users that don't have an email
      if (!user.email) {
        logStream.write(`Skipping user ${user.id} (${user.name}): No email\n`)
        continue
      }

      // Check if user already exists in auth.users
      const { data: existingAuthUser } = await supabase.auth.admin.getUserById(user.id)

      if (existingAuthUser) {
        logStream.write(`User ${user.id} (${user.email}) already exists in auth.users\n`)
        continue
      }

      // Create a temporary password if none exists
      const password = user.password_hash || `temp-${Math.random().toString(36).substring(2, 10)}`

      // Create the user in auth.users
      const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          student_id: user.student_id,
          role: user.role || "voter",
        },
        app_metadata: {
          provider: "email",
        },
      })

      if (createError) {
        logStream.write(`Error creating auth user for ${user.email}: ${createError.message}\n`)
        continue
      }

      logStream.write(`Successfully migrated user ${user.email}\n`)
    } catch (error: any) {
      logStream.write(`Error processing user ${user.id} (${user.email}): ${error.message}\n`)
    }
  }

  logStream.end()
  console.log("Migration completed. Check migration-log.txt for details.")
}

migrateUsers()
  .catch(console.error)
  .finally(() => process.exit())
