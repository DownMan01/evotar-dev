import { NextResponse } from "next/server"
import { getSession } from "@/actions/auth"
import { logSystemEvent, type SystemLogData } from "@/utils/system-logs"

export async function POST(request: Request) {
  try {
    // Check authentication and authorization
    const session = await getSession()
    if (!session?.isLoggedIn || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get log data from request
    const logData: SystemLogData = await request.json()

    // Validate required fields
    if (!logData.action || !logData.description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Log the event
    const success = await logSystemEvent({
      ...logData,
      userId: logData.userId || session.id,
    })

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to log event" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in system logs API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
