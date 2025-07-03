import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Check if this is an API route or static asset
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes("/favicon.ico") ||
    path.includes(".svg") ||
    path.includes(".png") ||
    path.includes(".jpg")
  ) {
    return NextResponse.next()
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get("session")?.value
  let isLoggedIn = false

  // Parse the session cookie to check if user is logged in
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie)
      isLoggedIn = session?.isLoggedIn === true
    } catch (e) {
      // Invalid session cookie, treat as not logged in
    }
  }

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/forgot-password", "/request-account", "/about", "/faq", "/terms", "/privacy"]
  const isPublicPath = publicPaths.some((pp) => path === pp || path.startsWith(`${pp}/`))

  // If the user is not logged in and trying to access a protected route
  if (!isLoggedIn && !isPublicPath) {
    const url = new URL("/", request.url)
    return NextResponse.redirect(url)
  }

  // If the user is logged in and trying to access the login page
  if (isLoggedIn && path === "/") {
    const url = new URL("/dashboard", request.url)
    return NextResponse.redirect(url)
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Configure which paths should be processed by middleware
export const config = {
  // Run middleware on all paths except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
