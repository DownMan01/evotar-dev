import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { inter } from "@/lib/fonts"

export const metadata: Metadata = {
  title: {
    template: "%s | Evotar",
    default: "Evotar - Web-based Voting Platform",
  },
  description: "A secure and transparent web-based voting platform",
  icons: {
    icon: "/favicon.ico",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
