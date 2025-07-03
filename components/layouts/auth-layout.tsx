import type React from "react"
import Link from "next/link"
import { BaseLayout } from "./base-layout"
import { ThemeProvider } from "@/components/theme-provider"

interface AuthLayoutProps {
  children: React.ReactNode
}

/**
 * Layout for authentication pages (login, register, etc.)
 * No sidebar, centered content
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <BaseLayout>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <div className="flex-1 flex flex-col bg-[#0077ff] relative overflow-hidden">
          <main className="flex-1 flex items-center justify-center w-full p-4">{children}</main>
          <footer className="py-4 text-center bg-white w-full">
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <Link href="/about" className="hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/faq" className="hover:text-gray-900 transition-colors">
                FAQ
              </Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <span>Evotar © {new Date().getFullYear()}</span>
            </div>
          </footer>
        </div>
      </ThemeProvider>
    </BaseLayout>
  )
}
