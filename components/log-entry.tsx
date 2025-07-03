"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, User, Clock, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface LogEntryProps {
  log: {
    id: string
    action: string
    description: string
    user?: { name: string } | null
    timestamp: string
    metadata?: any
  }
  badgeVariant: string
}

export function LogEntry({ log, badgeVariant }: LogEntryProps) {
  const [expanded, setExpanded] = useState(false)

  // Format the timestamp
  const formattedTime = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })

  // Check if there's metadata to display
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0

  return (
    <div className="p-3 bg-muted/20 rounded-md hover:bg-muted/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <Badge variant={badgeVariant} className="mt-0.5">
            {log.action}
          </Badge>
          <div>
            <p className="text-sm">{log.description}</p>
            {log.user && (
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                <span>{log.user.name}</span>
              </div>
            )}
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {hasMetadata && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {expanded && hasMetadata && (
        <div className="mt-2 pt-2 border-t border-border/30">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Info className="h-3 w-3" />
            <span>Additional Details</span>
          </div>
          <pre className="text-xs bg-muted/40 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
