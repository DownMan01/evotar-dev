"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MainHeader } from "@/components/main-header"
import { AppFooter } from "@/components/app-footer"
import MobileNav from "@/components/mobile-nav"
import type { UserRole } from "@/actions/auth"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"

interface MainLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    studentId: string
    role?: UserRole
  }
}

export function MainLayout({ children, user }: MainLayoutProps) {
  const pathname = usePathname()
  const isElectionsPage = pathname?.startsWith("/elections")

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col md:flex-row bg-[#0077ff]">
        {/* Sidebar - Only visible on desktop */}
        <AppSidebar user={user} />

        {/* Main content area with proper margin to avoid sidebar overlap */}
        <div className="flex-1 flex flex-col relative overflow-hidden md:ml-64">
          {/* Header */}
          <MainHeader user={user} />

          {/* Main Content */}
          <main className="flex-1 transition-all container mx-auto px-4 sm:px-6 py-6 max-w-6xl pb-20 md:pb-6">
            <div className="w-full">{children}</div>
          </main>

          {/* Footer */}
          <AppFooter />

          {/* Mobile Navigation */}
          <MobileNav user={user} />
        </div>
      </div>
    </ThemeProvider>
  )
}
