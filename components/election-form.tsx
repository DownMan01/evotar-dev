"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createElection, type ElectionFormData } from "@/actions/election-actions"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, CheckCircle2 } from "lucide-react"

type ElectionFormProps = {
  electionTypes: Array<{ id: string; name: string }>
  departments: Array<{ id: string; name: string }>
}

export function ElectionForm({ electionTypes, departments }: ElectionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<ElectionFormData>({
    title: "",
    description: "",
    election_type_id: "",
    department_id: null,
    start_date: "",
    end_date: "",
    show_results: false,
  })

  const handleChange = (field: keyof ElectionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate form data
      if (!formData.title) {
        setError("Title is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.election_type_id) {
        setError("Election type is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.start_date) {
        setError("Start date is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.end_date) {
        setError("End date is required")
        setIsSubmitting(false)
        return
      }

      // Check if end date is after start date
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        setError("End date must be after start date")
        setIsSubmitting(false)
        return
      }

      const result = await createElection(formData)

      if (result.success) {
        setSuccess(true)
        // Reset form
        setFormData({
          title: "",
          description: "",
          election_type_id: "",
          department_id: null,
          start_date: "",
          end_date: "",
          show_results: false,
        })

        // Redirect to elections page after a short delay
        setTimeout(() => {
          router.push("/elections")
        }, 2000)
      } else {
        setError(result.error || "Failed to create election")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">Election created successfully! Redirecting...</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter election title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter election description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="election_type">Election Type *</Label>
            <Select
              value={formData.election_type_id}
              onValueChange={(value) => handleChange("election_type_id", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select election type" />
              </SelectTrigger>
              <SelectContent>
                {electionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department_id || ""}
              onValueChange={(value) => handleChange("department_id", value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_results"
              checked={formData.show_results}
              onCheckedChange={(checked) => handleChange("show_results", checked)}
            />
            <Label htmlFor="show_results">Show results to voters</Label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/elections")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="mr-2" /> : null}
            {isSubmitting ? "Creating..." : "Create Election"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
