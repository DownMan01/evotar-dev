import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"

interface BaseLayoutProps {
  children: React.ReactNode
}

/**
 * Base layout component that wraps all pages
 * Provides theme support but no navigation elements
 */
export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <div className="min-h-screen flex flex-col">{children}</div>
    </ThemeProvider>
  )
}
