import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession } from "@/actions/auth"

export async function GET() {
  try {
    // Get all cookies
    const allCookies = cookies().getAll()
    const cookieData = allCookies.map((c) => ({
      name: c.name,
      value: c.name === "session" ? "[REDACTED]" : c.value,
      path: c.path,
      expires: c.expires,
    }))

    // Get session
    const session = await getSession()

    // Return session info
    return NextResponse.json({
      cookies: cookieData,
      session: {
        isLoggedIn: session?.isLoggedIn || false,
        role: session?.role || "none",
        userId: session?.userId || "none",
        name: session?.name || "none",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get session info" }, { status: 500 })
  }
}
