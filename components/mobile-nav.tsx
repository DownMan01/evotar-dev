"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Vote, Award, Database, LogOut, Users, Settings, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"
import type { UserRole } from "@/actions/auth"
import { useState, useEffect } from "react"

interface MobileNavProps {
  user?: {
    name: string
    studentId: string
    role?: UserRole
  }
}

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true)

    // Hide mobile nav during initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // Reduced timing for better UX

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const result = await logout()
      if (result.success) {
        // Use client-side navigation after successful logout
        router.push("/")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Define navigation items based on user role
  const navItems = getNavItems(user)

  // Check if we're on the login page or other public pages
  const isPublicPage = pathname === "/" || !user || !user.role

  // Don't render the mobile nav on public pages or before mounting
  if (isPublicPage || !isMounted) {
    return null
  }

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/60 backdrop-blur-md transition-opacity duration-300 ${
        isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-around">
        {navItems.slice(0, 4).map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-3 px-2 min-w-[4rem] focus:outline-none",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex flex-col items-center py-3 px-2 min-w-[4rem] text-muted-foreground hover:text-foreground disabled:opacity-50 focus:outline-none"
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">{isLoggingOut ? "..." : "Logout"}</span>
        </button>
      </div>
    </div>
  )
}

// Helper function to get navigation items based on user role
function getNavItems(user?: { role?: UserRole }) {
  // If no user or no role, return minimal navigation
  if (!user || !user.role) {
    return [
      {
        name: "Home",
        href: "/",
        icon: LayoutDashboard,
      },
    ]
  }

  const baseItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ]

  // Items for all users
  const commonItems = [
    {
      name: "Results",
      href: "/results",
      icon: Award,
    },
  ]

  // Role-specific items
  if (user.role === "admin") {
    return [
      ...baseItems,
      {
        name: "Users",
        href: "/users",
        icon: Users,
      },
      {
        name: "Elections",
        href: "/elections",
        icon: Vote,
      },
      {
        name: "System",
        href: "/system",
        icon: Settings,
      },
    ]
  } else if (user.role === "staff") {
    return [
      ...baseItems,
      {
        name: "Elections",
        href: "/elections",
        icon: Vote,
      },
      {
        name: "Create",
        href: "/elections/create",
        icon: PlusCircle,
      },
      ...commonItems,
    ]
  } else {
    // Voter role
    return [
      ...baseItems,
      {
        name: "Elections",
        href: "/elections",
        icon: Vote,
      },
      ...commonItems,
      {
        name: "Blockchain",
        href: "/blockchain",
        icon: Database,
      },
    ]
  }
}
