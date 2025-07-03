"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, User } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createUser } from "@/actions/auth"
import Image from "next/image"

// Define the props type
type CreateUserPageProps = {
  session: any
  departments: any[]
}

// This is a client component that receives props from the server component
export default function CreateUserPageClient({ session, departments }: CreateUserPageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      // Store the base64 string which will be saved to user_img column
      setProfileImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleCreateUser(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      const name = formData.get("name") as string
      const studentId = formData.get("studentId") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const role = formData.get("role") as string
      const departmentId = formData.get("department") as string
      const yearLevel = formData.get("yearLevel") as string

      if (!name || !studentId || !email || !password || !role || !yearLevel) {
        setError("All required fields must be filled")
        setIsSubmitting(false)
        return
      }

      // Create the user data object
      const userData = {
        name,
        student_id: studentId,
        email,
        password,
        role,
        department_id: departmentId === "none" ? null : departmentId || null,
        year_level: yearLevel,
        user_img: profileImage, // This ensures the image is stored in the user_img column
      }

      const result = await createUser(userData)

      if (result.success) {
        router.push("/users")
        router.refresh()
      } else {
        setError(result.error || "Failed to create user")
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader user={session} />

      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/users" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Users
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Create New User</h1>

        <Card className="bg-card/80 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Add a new user to the system with blockchain wallet</CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6">
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <form action={handleCreateUser}>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profileImage ? (
                    <Image
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-6 w-6 text-white" />
                    <span className="sr-only">Upload profile image</span>
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="Enter full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" name="studentId" placeholder="Enter student ID" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Enter email address" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Enter password" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue="voter">
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voter">Voter</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select name="department" defaultValue="none">
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Year Level Selection */}
              <div className="space-y-2">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Select name="yearLevel" required defaultValue="">
                  <SelectTrigger id="yearLevel">
                    <SelectValue placeholder="Select year level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted/50 rounded-md border border-dashed">
                <p className="text-sm font-medium">Blockchain Wallet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A blockchain wallet will be automatically created for this user when you submit this form. The wallet
                  address will be associated with their account for voting on the blockchain.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/users">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      <footer className="py-6 border-t border-border/40 backdrop-blur-sm hidden md:block">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Evotar - Blockchain Voting Platform © {new Date().getFullYear()}</p>
          <p className="mt-1">Secure, Transparent, Immutable</p>
        </div>
      </footer>
    </div>
  )
}
