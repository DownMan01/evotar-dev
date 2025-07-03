"use client"

import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, FileEdit } from "lucide-react"
import { getUsers } from "@/services/dashboard"
import DeleteUserButton from "@/components/delete-user-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

// Add this line to force dynamic rendering
export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin can access this page
  if (session.role !== "admin") {
    redirect("/dashboard")
  }

  // Get users data
  const users = await getUsers(100) // Get up to 100 users

  // Add a loading state
  const [isLoading, setIsLoading] = useState(true)

  // Add useEffect to simulate loading and then set loading to false
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all user accounts in the system</p>
        </div>
        <Button asChild>
          <Link href="/users/create">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Link>
        </Button>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="grid grid-cols-5 gap-4 w-full">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-3 border-b">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
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
                      <TableCell>{user.department?.name || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/users/${user.id}/edit`}>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                          <DeleteUserButton userId={user.id} userName={user.name} disabled={user.id === session.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
