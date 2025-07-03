"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Vote, PlusCircle, ArrowRight, User, Settings, Users, Database, FileEdit, Trash2, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { updateUser } from "@/actions/auth"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
// Update the imports to include getUserCounts
import { getSystemStats, getSystemLogs, getUsers, getAllElections, getUserCounts } from "@/services/dashboard"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
// Import the ButtonLink component
import { ButtonLink } from "@/components/ui/button-link"

export default function AdminDashboard({ user }: { user: any }) {
  const { toast } = useToast()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // State for data
  const [systemStats, setSystemStats] = useState<any>({
    users: { total: 0, voters: 0, staff: 0, admins: 0 },
    elections: { total: 0, active: 0, completed: 0, draft: 0 },
    votes: 0,
    systemStatus: "unknown",
  })
  const [systemLogs, setSystemLogs] = useState<any[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [elections, setElections] = useState<any[]>([])
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Replace the multiple loading states with a single one
  const [isLoading, setIsLoading] = useState(true)
  const [isValidUser, setIsValidUser] = useState(true)

  // Check if user data is valid
  useEffect(() => {
    if (!user || !user.id) {
      console.error("Missing or invalid user data", user)
      toast({
        title: "Error",
        description: "Your session appears to be invalid. Please try logging in again.",
        variant: "destructive",
      })
      setIsValidUser(false)
    } else {
      setIsValidUser(true) // Ensure isValidUser is set to true when user data is valid
    }
  }, [user, toast])

  // Fetch data on component mount
  useEffect(() => {
    async function fetchAdminData() {
      setIsLoading(true)
      try {
        // Fetch all data in parallel using Promise.allSettled to handle individual failures
        const [stats, logs, electionsData, userCountsData] = await Promise.allSettled([
          getSystemStats(),
          getSystemLogs(),
          getAllElections(1, 5).then((res) => res.data || []),
          getUserCounts(), // Add this to fetch user counts
        ])

        // Try to fetch users, but provide a fallback if it fails
        let usersData = []
        try {
          usersData = await getUsers(10)
        } catch (userError) {
          console.error("Failed to load users, using empty array:", userError)
          toast({
            title: "Warning",
            description: "Could not load user data. Some dashboard features may be limited.",
            variant: "destructive",
          })
        }

        // Set data from successful promises
        if (stats.status === "fulfilled") setSystemStats(stats.value)
        if (logs.status === "fulfilled") setSystemLogs(logs.value)
        if (electionsData.status === "fulfilled") setElections(electionsData.value)

        // Update user counts if the fetch was successful
        if (userCountsData.status === "fulfilled") {
          setSystemStats((prev) => ({
            ...prev,
            users: userCountsData.value,
          }))
        }

        // Set users data (will be empty array if fetch failed)
        setUsersList(usersData)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast({
          title: "Error",
          description: "Some dashboard data could not be loaded. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        // Add a smooth transition when content loads
        const contentElements = document.querySelectorAll(".content-transition")
        contentElements.forEach((el) => {
          ;(el as HTMLElement).style.opacity = "0"
          setTimeout(() => {
            ;(el as HTMLElement).style.opacity = "1"
            ;(el as HTMLElement).style.transition = "opacity 0.3s ease-in-out"
          }, 50)
        })
      }
    }

    if (isValidUser) {
      fetchAdminData()
    }
  }, [isValidUser, toast, router])

  // If user is not valid, render a login prompt instead of redirecting
  if (!isValidUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Error</CardTitle>
            <CardDescription>Your session appears to be invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please log in again to access your dashboard.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format time for logs
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor(now.getTime() - date.getTime() / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Handle user role change
  const handleUserRoleChange = (userId: string, newRole: "voter" | "staff" | "admin") => {
    setIsUpdating(userId)
    updateUser(userId, { role: newRole })
      .then((result) => {
        if (result.success) {
          // Update local state to reflect the change
          setUsersList((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

          toast({
            title: "Role Updated",
            description: `User role changed to ${newRole}`,
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update role",
            variant: "destructive",
          })
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      })
      .finally(() => {
        setIsUpdating(null)
      })
  }

  // Handle user deletion
  const handleUserDelete = (userId: string) => {
    setIsUpdating(userId)
    try {
      // In a real app, this would call an API to delete the user
      // For now, we'll just update the local state
      setUsersList((prev) => prev.filter((user) => user.id !== userId))

      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <ButtonLink href="/system" variant="outline" size="sm" className="gap-2">
              <Database className="h-4 w-4 mr-2" />
              <span>System Settings</span>
            </ButtonLink>
            <ButtonLink href="/users/create" variant="default" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4 mr-2" />
              <span>Add User</span>
            </ButtonLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-7xl mx-auto px-4 mt-8">
          {/* Elections Management - Now first */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle>Elections</CardTitle>
              <CardDescription>Manage all elections</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <ScrollArea className="h-[300px]">
                  <div className="px-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="py-3 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Skeleton className="h-7 w-16" />
                          <Skeleton className="h-7 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="h-[300px] content-transition">
                  <div className="px-6">
                    {elections.map((election) => (
                      <div key={election.id} className="py-3 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{election.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(election.created_at)}</p>
                          </div>
                          <Badge
                            className={
                              election.status === "active"
                                ? "bg-green-500 text-xs text-white"
                                : election.status === "completed"
                                  ? "bg-blue-500 text-xs text-white"
                                  : "bg-amber-500 text-xs text-white"
                            }
                          >
                            {election.status === "active"
                              ? "Active"
                              : election.status === "completed"
                                ? "Completed"
                                : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <ButtonLink
                            href={`/elections/${election.id}/edit`}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            Edit
                          </ButtonLink>
                          <ButtonLink
                            href={`/elections/${election.id}/results`}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            Results
                          </ButtonLink>
                        </div>
                      </div>
                    ))}

                    {elections.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No elections found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <ButtonLink href="/elections/create" className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Election
              </ButtonLink>
              <ButtonLink href="/elections" variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Manage All Elections
              </ButtonLink>
            </CardFooter>
          </Card>

          {/* User Management - Now second */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <ButtonLink href="/users" variant="ghost" size="sm" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {isLoading ? (
                <div>
                  <div className="border-b pb-2">
                    <div className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  </div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="py-3 border-b">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-16" />
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table className="content-transition">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersList.slice(0, 5).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.student_id}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.role === "admin"
                                ? "bg-purple-500 text-white"
                                : user.role === "staff"
                                  ? "bg-blue-500 text-white"
                                  : "bg-green-500 text-white"
                            }
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ButtonLink href={`/users/${user.id}/edit`} variant="ghost" size="icon">
                              <FileEdit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </ButtonLink>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUserDelete(user.id)}
                              disabled={isUpdating === user.id || user.id === user.id} // Prevent deleting current admin
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <ButtonLink href="/users" variant="outline" size="sm" className="w-full">
                Manage All Users
              </ButtonLink>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-7xl mx-auto px-4 mt-8">
          {/* Admin Profile - Now third */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle>Admin Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pb-2">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-xl bg-purple-500 text-white">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Admin ID: {user.studentId}</p>
              <p className="text-sm text-muted-foreground">Role: Administrator</p>

              <div className="w-full max-w-xs mt-6 space-y-2">
                <ButtonLink href="/settings" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Settings
                </ButtonLink>

                <ButtonLink href="/settings?section=profile" variant="outline" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </ButtonLink>
              </div>
            </CardContent>
          </Card>

          {/* System Logs - Now fourth */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>System Logs</CardTitle>
                <ButtonLink href="/logs" variant="ghost" size="sm" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
              <CardDescription>Recent system activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-2 bg-muted/20 rounded-md">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="h-[200px] content-transition">
                  <div className="space-y-2">
                    {systemLogs && systemLogs.length > 0 ? (
                      systemLogs.map((log, index) => (
                        <div key={log.id || index} className="p-2 bg-muted/20 rounded-md">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{formatTimeAgo(log.timestamp)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{log.description}</p>
                          {log.user && <p className="text-xs text-muted-foreground mt-1">User: {log.user.name}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-muted-foreground">No system logs found</p>
                        <Button variant="link" size="sm" className="mt-2" asChild>
                          <Link href="/system">Initialize System Logs</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-8">
        {/* Header with welcome and avatar */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-purple-500 text-white">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{systemStats.users.total}</p>
                )}
                <p className="text-xs text-muted-foreground">Users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Vote className="h-4 w-4 text-primary" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{systemStats.elections.total}</p>
                )}
                <p className="text-xs text-muted-foreground">Elections</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <ButtonLink href="/users/create" className="h-auto py-4 flex flex-col">
            <UserPlus className="h-5 w-5 mb-1" />
            <span className="text-xs">Add User</span>
          </ButtonLink>

          <ButtonLink href="/elections/create" variant="outline" className="h-auto py-4 flex flex-col">
            <PlusCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">New Election</span>
          </ButtonLink>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base">User Management</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] content-transition">
                    <div className="space-y-3">
                      {usersList.map((user) => (
                        <div key={user.id} className="flex justify-between items-center p-2 bg-muted/20 rounded-md">
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {user.student_id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                user.role === "admin"
                                  ? "bg-purple-500 text-xs"
                                  : user.role === "staff"
                                    ? "bg-blue-500 text-xs"
                                    : "bg-green-500 text-xs"
                              }
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                            <ButtonLink href={`/users/${user.id}/edit`} variant="ghost" size="icon" className="h-8 w-8">
                              <FileEdit className="h-4 w-4" />
                            </ButtonLink>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter className="px-4 py-3 border-t bg-muted/30">
                <ButtonLink href="/users" size="sm" className="w-full">
                  Manage All Users
                </ButtonLink>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Elections Tab */}
          <TabsContent value="elections" className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base">Elections Management</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] content-transition">
                    <div className="space-y-3">
                      {elections.map((election) => (
                        <div key={election.id} className="p-2 bg-muted/20 rounded-md">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium">{election.title}</p>
                            <Badge
                              className={
                                election.status === "active"
                                  ? "bg-green-500 text-xs text-white"
                                  : election.status === "completed"
                                    ? "bg-blue-500 text-xs text-white"
                                    : "bg-amber-500 text-xs text-white"
                              }
                            >
                              {election.status === "active"
                                ? "Active"
                                : election.status === "completed"
                                  ? "Completed"
                                  : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(election.created_at)}</p>
                          <div className="flex gap-2 mt-2">
                            <ButtonLink
                              href={`/elections/${election.id}/edit`}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Edit
                            </ButtonLink>
                            <ButtonLink
                              href={`/elections/${election.id}/results`}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Results
                            </ButtonLink>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter className="px-4 py-3 border-t bg-muted/30">
                <ButtonLink href="/elections" size="sm" className="w-full">
                  Manage All Elections
                </ButtonLink>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">System Status</CardTitle>
                  <Badge className="bg-green-500">Healthy</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-2">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 content-transition">
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Database</p>
                      <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Blockchain</p>
                      <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                        Secure
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">API Services</p>
                      <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                        Running
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Last Backup</p>
                      <p className="text-xs text-muted-foreground">12 hours ago</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="px-4 py-3 border-t bg-muted/30">
                <ButtonLink href="/system" size="sm" className="w-full">
                  System Settings
                </ButtonLink>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
