import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { MainLayout } from "@/components/layouts/main-layout"

export const dynamic = "force-dynamic"

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  return <MainLayout user={session}>{children}</MainLayout>
}
