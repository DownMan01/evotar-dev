import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import VoterDashboard from "@/components/dashboards/voter-dashboard"
import StaffDashboard from "@/components/dashboards/staff-dashboard"
import AdminDashboard from "@/components/dashboards/admin-dashboard"

export const dynamic = "force-dynamic"

async function DashboardContent() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Render the appropriate dashboard based on user role
  switch (session.role) {
    case "admin":
      return <AdminDashboard user={session} />
    case "staff":
      return <StaffDashboard user={session} />
    case "voter":
    default:
      return <VoterDashboard user={session} />
  }
}

export default async function DashboardPage() {
  return <DashboardContent />
}
