import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { MainLayout } from "@/components/layouts/main-layout"

export const dynamic = "force-dynamic"

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin can access this section
  if (session.role !== "admin") {
    redirect("/dashboard")
  }

  return <MainLayout user={session}>{children}</MainLayout>
}
