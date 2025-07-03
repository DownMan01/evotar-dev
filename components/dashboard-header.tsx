"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"
import type { UserRole } from "@/actions/auth"
import { logout } from "@/actions/auth"

interface DashboardHeaderProps {
  user?: {
    name: string
    studentId: string
    role?: UserRole
    id: string
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-4 ml-auto">
          {user && (
            <div className="text-sm hidden md:block">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs block text-muted-foreground">
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Guest"} • ID: {user.studentId}
              </span>
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  )
}
