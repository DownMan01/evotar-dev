"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Vote, Users, LayoutDashboard, BarChart3, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/actions/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/actions/auth"

interface AppSidebarProps {
  user?: {
    name: string
    studentId: string
    role?: UserRole
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const result = await logout()
      if (result.success) {
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

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-background/95 backdrop-blur-sm border-r border-border/40 shadow-sm z-50">
      {/* Logo and Brand - Increased padding and z-index */}
      <div className="py-4 flex items-center px-6 border-b border-border/40 h-16">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-lg text-primary">evotar</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-primary hover:bg-muted/50"
            }`}
          >
            {item.icon && <item.icon className="h-4 w-4 mr-3" />}
            {item.name}
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-3 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </nav>
  )
}

// Helper function to get navigation items
function getNavItems(user?: { role?: UserRole }) {
  if (!user || !user.role) {
    return [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ]
  }

  if (user.role === "admin") {
    return [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
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
        name: "Candidates",
        href: "/candidates",
        icon: Users,
      },
      {
        name: "Results",
        href: "/results",
        icon: BarChart3,
      },
      {
        name: "System",
        href: "/system",
        icon: Settings,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: User,
      },
    ]
  } else {
    return [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Elections",
        href: "/elections",
        icon: Vote,
      },
      {
        name: "Candidates",
        href: "/candidates",
        icon: Users,
      },
      {
        name: "Results",
        href: "/results",
        icon: BarChart3,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: User,
      },
    ]
  }
}
