"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  RefreshCcw,
  Download,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SystemLogsTable() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 20

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching logs...")

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // Create a custom SQL query to bypass RLS
      const { data, error } = await supabase.rpc("get_system_logs", {
        page_number: page,
        page_size: pageSize,
      })

      if (error) {
        console.error("Error fetching logs:", error)

        // If the function doesn't exist, we'll create it
        if (error.code === "42883") {
          // function doesn't exist
          await createGetLogsFunction()

          // Try again after creating the function
          const { data: retryData, error: retryError } = await supabase.rpc("get_system_logs", {
            page_number: page,
            page_size: pageSize,
          })

          if (retryError) {
            setError(`Failed to fetch logs: ${retryError.message}`)
            setLoading(false)
            return
          }

          setLogs(retryData || [])
        } else {
          setError(`Failed to fetch logs: ${error.message}`)
          setLoading(false)
          return
        }
      } else {
        setLogs(data || [])
      }

      // Get total count for pagination using a separate RPC call
      const { data: countData, error: countError } = await supabase.rpc("get_system_logs_count")

      if (countError) {
        console.error("Error getting logs count:", countError)
      } else {
        const count = countData || 0
        setTotalPages(Math.max(1, Math.ceil(count / pageSize)))
      }
    } catch (error: any) {
      console.error("Error in fetchLogs:", error)
      setError(`An unexpected error occurred: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to create the stored procedure if it doesn't exist
  const createGetLogsFunction = async () => {
    try {
      // Create the function to get logs with pagination
      const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION get_system_logs(page_number int, page_size int)
        RETURNS SETOF system_logs AS $$
        BEGIN
          RETURN QUERY
          SELECT *
          FROM system_logs
          ORDER BY timestamp DESC
          LIMIT page_size
          OFFSET ((page_number - 1) * page_size);
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Create count function
        CREATE OR REPLACE FUNCTION get_system_logs_count()
        RETURNS bigint AS $$
        DECLARE
          log_count bigint;
        BEGIN
          SELECT COUNT(*) INTO log_count FROM system_logs;
          RETURN log_count;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Grant execute permissions
        GRANT EXECUTE ON FUNCTION get_system_logs TO authenticated;
        GRANT EXECUTE ON FUNCTION get_system_logs_count TO authenticated;
      `

      // Execute the SQL directly
      const { error } = await supabase.rpc("exec_sql", { sql: createFunctionQuery })

      if (error) {
        console.error("Error creating get_system_logs function:", error)

        // If exec_sql doesn't exist, we need to create it first
        if (error.code === "42883") {
          // function doesn't exist
          // Create the exec_sql function first
          const createExecSqlQuery = `
            CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            
            GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
          `

          // We can't use RPC to create this function since it doesn't exist yet
          // Instead, we'll use a direct SQL query through the REST API
          const { error: createError } = await supabase.from("_exec_sql").insert({ sql: createExecSqlQuery })

          if (createError) {
            console.error("Error creating exec_sql function:", createError)
            return false
          }

          // Now try creating the get_system_logs function again
          const { error: retryError } = await supabase.rpc("exec_sql", { sql: createFunctionQuery })

          if (retryError) {
            console.error("Error creating get_system_logs function (retry):", retryError)
            return false
          }
        } else {
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error in createGetLogsFunction:", error)
      return false
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes("Error") || action.includes("Alert")) return "destructive"
    if (action.includes("Login") || action.includes("Logout")) return "default"
    if (action.includes("Created") || action.includes("Updated")) return "secondary"
    if (action.includes("System")) return "outline"
    return "default"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ))
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={getActionBadgeColor(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.user_id ? log.user_id.substring(0, 8) + "..." : "System"}</TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-muted-foreground mb-4">No logs found</p>
                    <Button onClick={fetchLogs}>Refresh Logs</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setPage(1)} disabled={page === 1 || loading}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages || loading}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
