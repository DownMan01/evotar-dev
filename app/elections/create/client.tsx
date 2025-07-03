"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Calendar } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createElection } from "@/actions/election-actions"

// Define the props type
type CreateElectionPageProps = {
  session: any
  electionTypes: any[]
  departments: any[]
}

export default function CreateElectionPageClient({ session, electionTypes, departments }: CreateElectionPageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreateElection(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const electionTypeId = formData.get("electionType") as string
    const departmentId = formData.get("department") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const showResults = formData.get("showResults") === "on"

    if (!title || !electionTypeId || !startDate || !endDate) {
      setError("All required fields must be filled")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await createElection({
        title,
        description,
        election_type_id: electionTypeId,
        department_id: departmentId || null,
        start_date: startDate,
        end_date: endDate,
        show_results: showResults,
      })

      if (result.success) {
        router.push("/elections")
      } else {
        setError(result.error || "Failed to create election")
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
            <Link href="/elections" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Elections
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">Create New Election</h1>

        <Card className="bg-card/80 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Election Details</CardTitle>
            <CardDescription>Create a new election for voters to participate in</CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6">
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <form action={handleCreateElection}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Enter election title" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter election description"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="electionType">Election Type</Label>
                  <Select name="electionType" required>
                    <SelectTrigger id="electionType">
                      <SelectValue placeholder="Select election type" />
                    </SelectTrigger>
                    <SelectContent>
                      {electionTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Select name="department">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="startDate" name="startDate" type="datetime-local" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="endDate" name="endDate" type="datetime-local" className="pl-10" required />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="showResults" name="showResults" />
                <Label htmlFor="showResults">Show results to voters</Label>
              </div>

              <div className="p-4 bg-muted/50 rounded-md border border-dashed">
                <p className="text-sm font-medium">Blockchain Verification</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This election will be verified on the blockchain, ensuring transparency and immutability of the voting
                  results. Each vote will be recorded as a transaction on the blockchain.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/elections">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Election"}
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
