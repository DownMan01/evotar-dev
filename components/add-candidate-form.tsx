"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { addCandidate } from "@/actions/candidate-actions"

interface AddCandidateFormProps {
  electionId: string
  positions: Array<{ id: string; name: string }>
  electionType: any
  departments: Array<{ id: string; name: string }>
}

export default function AddCandidateForm({ electionId, positions, electionType, departments }: AddCandidateFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    positionId: "",
    departmentId: "",
    party: "",
    info: "",
  })

  useEffect(() => {
    console.log("Election Type:", electionType)
  }, [electionType])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Log form data before submission
    console.log("Form Data:", formData)

    try {
      const result = await addCandidate({
        election_id: electionId,
        name: formData.name,
        student_id: formData.studentId,
        position_id: formData.positionId,
        department_id: formData.departmentId === "none" ? null : formData.departmentId,
        party: formData.party,
        bio: formData.info,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Candidate added successfully",
        })
        router.push(`/elections/${electionId}/candidates`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add candidate",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
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
                {positions.map((position) => (
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
              Adding...
            </>
          ) : (
            "Add Candidate"
          )}
        </Button>
      </CardFooter>
    </form>
  )
}
