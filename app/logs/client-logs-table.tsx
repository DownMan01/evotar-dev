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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSystemLogs } from "@/actions/admin-actions"

export default function ClientLogsTable() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 10

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getSystemLogs(page, pageSize)

      if (!result.success) {
        setError(result.error || "Failed to fetch logs")
        return
      }

      setLogs(result.data || [])
      setTotalPages(result.pagination?.totalPages || 1)
    } catch (error: any) {
      console.error("Error in fetchLogs:", error)
      setError(`An unexpected error occurred: ${error.message}`)
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
