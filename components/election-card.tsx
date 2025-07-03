import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronRightIcon } from "lucide-react"

interface ElectionCardProps {
  id: string
  title: string
  description: string
  status: "draft" | "active" | "completed"
  endDate: Date
  type: string
  department?: string | null
}

export function ElectionCard({ id, title, description, status, endDate, type, department }: ElectionCardProps) {
  // Format the end date
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(endDate)

  // Calculate if the election is ending soon (within 24 hours)
  const isEndingSoon = endDate.getTime() - Date.now() < 24 * 60 * 60 * 1000

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant={status === "active" ? "default" : "outline"}>
            {status === "active" ? "Active" : status === "completed" ? "Completed" : "Draft"}
          </Badge>
          {department && (
            <Badge variant="outline" className="ml-2">
              {department}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mt-2">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{type}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-foreground/80 line-clamp-2">{description}</p>
        <div className="flex items-center mt-4 text-xs text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
          <span>
            {isEndingSoon ? (
              <span className="text-destructive font-medium">Ends {formattedDate}</span>
            ) : (
              <span>Ends {formattedDate}</span>
            )}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Link href={`/elections/${id}`} className="w-full">
          <Button variant="default">
            <span>View Election</span>
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
