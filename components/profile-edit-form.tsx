"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { updateUserProfile } from "@/actions/update-profile"
import { createClient } from "@/lib/supabase/client" // Import client-side Supabase client

interface ProfileEditFormProps {
  user: any
  onSuccess?: () => void
}

export function ProfileEditForm({ user, onSuccess }: ProfileEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabaseClient = createClient() // Create client-side Supabase client

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateUserProfile(formData)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        setError(result.error || "Failed to update profile")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" defaultValue={user?.name || ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user?.email || ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearLevel">Year Level</Label>
        <Select name="yearLevel" defaultValue={user?.year_level || "not-specified"}>
          <SelectTrigger>
            <SelectValue placeholder="Select year level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not-specified">Not specified</SelectItem>
            <SelectItem value="1st Year">1st Year</SelectItem>
            <SelectItem value="2nd Year">2nd Year</SelectItem>
            <SelectItem value="3rd Year">3rd Year</SelectItem>
            <SelectItem value="4th Year">4th Year</SelectItem>
            <SelectItem value="5th Year">5th Year</SelectItem>
            <SelectItem value="Graduate">Graduate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input
          id="avatar_url"
          name="avatar_url"
          type="url"
          placeholder="Optional"
          defaultValue={user?.user_img || ""}
        />
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
