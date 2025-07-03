import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create a server-side Supabase client with service role key for admin access
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Query the votes table to count distinct user_id values
    const { data, error, count } = await supabase.from("votes").select("user_id", { count: "distinct" })

    console.log("API Route - Voters Voted Query:", { data, error, count }) // Add logging here

    if (error) {
      console.error("Error querying voters voted count:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Extract the count from the data if it exists
    const distinctCount = data ? data.length : 0

    return NextResponse.json({ success: true, count: distinctCount })
  } catch (error) {
    console.error("Exception in voters voted count API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
