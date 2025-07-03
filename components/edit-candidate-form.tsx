"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface EditCandidateFormProps {
  candidate: any
  positions: Array<{ id: string; name: string; election_type_id: string }>
  departments: Array<{ id: string; name: string }>
}

export default function EditCandidateForm({ candidate, positions, departments }: EditCandidateFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: candidate.name || "",
    studentId: candidate.user?.student_id || "",
    positionId: candidate.position_id || "",
    departmentId: candidate.department_id || "",
    party: candidate.party || "",
    info: candidate.info || "",
  })

  // Filter positions by the election's type
  const filteredPositions = positions.filter((p) => p.election_type_id === candidate.election?.election_type_id)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClientComponentClient()

    try {
      // Update the candidate
      const { error: candidateError } = await supabase
        .from("candidates")
        .update({
          name: formData.name,
          position_id: formData.positionId,
          department_id: formData.departmentId || null,
          party: formData.party || null,
          info: formData.info || null,
        })
        .eq("id", candidate.id)

      if (candidateError) {
        throw new Error(`Failed to update candidate: ${candidateError.message}`)
      }

      // Update the associated user if student ID changed
      if (candidate.user && formData.studentId !== candidate.user.student_id) {
        const { error: userError } = await supabase
          .from("users")
          .update({
            student_id: formData.studentId,
            name: formData.name,
          })
          .eq("id", candidate.user.id)

        if (userError) {
          throw new Error(`Failed to update user: ${userError.message}`)
        }
      }

      toast({
        title: "Success",
        description: "Candidate updated successfully",
      })

      // Redirect to the election candidates page
      router.push(`/elections/${candidate.election_id}/candidates`)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update candidate",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter candidate's full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              placeholder="Enter student ID"
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="position">Position</Label>
            <Select value={formData.positionId} onValueChange={(value) => handleChange("positionId", value)} required>
              <SelectTrigger id="position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {filteredPositions.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Select value={formData.departmentId} onValueChange={(value) => handleChange("departmentId", value)}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="party">Party Affiliation</Label>
          <Input
            id="party"
            placeholder="Enter party affiliation (optional)"
            value={formData.party}
            onChange={(e) => handleChange("party", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="info">Bio / Information</Label>
          <Textarea
            id="info"
            placeholder="Enter candidate bio or additional information"
            value={formData.info}
            onChange={(e) => handleChange("info", e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
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
      </CardFooter>
    </form>
  )
}
