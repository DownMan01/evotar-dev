"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, RefreshCcw, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function SystemLogsTable() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // Get total count
      const { count } = await supabase.from("system_logs").select("*", { count: "exact", head: true })

      // Calculate total pages
      const total = count || 0
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)))

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
          user:users(name)
        `)
        .order("timestamp", { ascending: false })
        .range(from, to)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast({
        title: "Error",
        description: "Failed to load system logs",
        variant: "destructive",
      })
      setLogs([])
    } finally {
      setLoading(false)
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User</TableHead>
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
                  <TableCell>{log.user?.name || "System"}</TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No logs found
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
