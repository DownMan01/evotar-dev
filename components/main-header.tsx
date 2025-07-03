"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { AppSidebar } from "./app-sidebar"
import type { UserRole } from "@/actions/auth"

interface MainHeaderProps {
  user?: {
    name: string
    studentId: string
    role?: UserRole
  }
}

export function MainHeader({ user }: MainHeaderProps) {
  const { setTheme, theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo and Brand - Only visible on mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-lg text-primary">evotar</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <AppSidebar user={user} />
          </SheetContent>
        </Sheet>

        {/* Right side controls */}
        <div className="flex items-center gap-4 ml-auto">
          {/* User info - Only visible on desktop */}
          {user && (
            <div className="text-sm hidden md:block">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs block text-muted-foreground">
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Guest"} • ID: {user.studentId}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu - Only visible on mobile */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
