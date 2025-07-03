import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ProfileViewProps {
  user: {
    name: string
    student_id: string
    email: string
    role: string
    year_level?: string
    user_img?: string | null
    department?: {
      id: string
      name: string
      code: string
    } | null
  }
}

export function ProfileView({ user }: ProfileViewProps) {
  const roleBadgeColor = user.role === "admin" ? "bg-red-500" : user.role === "staff" ? "bg-blue-500" : "bg-green-500"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="w-24 h-24">
          {user.user_img ? (
            <AvatarImage src={user.user_img || "/placeholder.svg"} alt={user.name} />
          ) : (
            <AvatarFallback className="text-2xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>

        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <Badge className={roleBadgeColor}>{user.role}</Badge>
            {user.department && <Badge variant="outline">{user.department.name}</Badge>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 pt-4 border-t">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Student ID</p>
            <p className="font-medium">{user.student_id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.year_level && (
            <div>
              <p className="text-sm text-muted-foreground">Year Level</p>
              <p className="font-medium">{user.year_level}</p>
            </div>
          )}
          {user.department && (
            <div>
              <p className="text-sm text-muted-foreground">Department Code</p>
              <p className="font-medium">{user.department.code}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
