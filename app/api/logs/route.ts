import { NextResponse } from "next/server"
import { getSession } from "@/actions/auth"
import { logSystemEvent, type SystemLogData } from "@/utils/system-logs"
import { supabase } from "@/supabase"

// Update the API route to properly handle log creation

// Improve the POST handler to ensure logs are properly created:
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

    return NextResponse.json({
      success: true,
      message: "Log entry created successfully",
    })
  } catch (error) {
    console.error("Error in system logs API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Add a GET handler to retrieve logs
export async function GET(request: Request) {
  try {
    // Check authentication and authorization
    const session = await getSession()
    if (!session?.isLoggedIn || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")

    // Calculate pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Get total count
    const { count, error: countError } = await supabase.from("system_logs").select("*", { count: "exact", head: true })

    if (countError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to count logs",
          details: countError.message,
        },
        { status: 500 },
      )
    }

    // Get logs for current page
    const { data, error } = await supabase
      .from("system_logs")
      .select(`
       id,
       action,
       description,
       user_id,
       timestamp,
       metadata,
       users:user_id(name)
     `)
      .order("timestamp", { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch logs",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    })
  } catch (error) {
    console.error("Error in system logs API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
