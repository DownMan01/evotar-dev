"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { updateElection } from "./actions"

export default function EditElectionPageClient({
  election,
  electionTypes,
  departments,
}: {
  election: any
  electionTypes: any[]
  departments: any[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format dates for input fields
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16) // Format as YYYY-MM-DDThh:mm
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updateElection(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Election updated successfully",
        })
        // Use client-side navigation instead of server redirect
        router.push("/elections")
      } else {
        setError(result.error || "Failed to update election")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/elections" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Elections
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Election</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <form action={handleSubmit}>
          <input type="hidden" name="id" value={election.id} />

          <CardHeader>
            <CardTitle>Election Details</CardTitle>
            <CardDescription>Edit the details of this election</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={election.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={election.description}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="electionType">Election Type</Label>
                <Select name="electionType" defaultValue={election.election_type_id} required>
                  <SelectTrigger id="electionType">
                    <SelectValue placeholder="Select election type" />
                  </SelectTrigger>
                  <SelectContent>
                    {electionTypes.length > 0 ? (
                      electionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value={election.election_type_id}>
                        {election.election_type?.name || "Current Type"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {electionTypes.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Could not load election types. Using current type only.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Select name="department" defaultValue={election.department_id || "none"}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.length > 0 ? (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))
                    ) : election.department_id && election.department?.name ? (
                      <SelectItem value={election.department_id}>{election.department.name}</SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
                {departments.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Could not load departments. {election.department?.name ? "Using current department only." : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    className="pl-10"
                    defaultValue={formatDateForInput(election.start_date)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    className="pl-10"
                    defaultValue={formatDateForInput(election.end_date)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={election.status} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="showResults" name="showResults" defaultChecked={election.show_results} />
              <Label htmlFor="showResults">Show results to voters</Label>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/elections">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
