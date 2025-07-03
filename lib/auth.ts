import { cookies } from "next/headers"
import { redirect } from "next/navigation"

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

export async function requireAuth() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard")
  }

  return session
}
