"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Vote,
  PlusCircle,
  Clock,
  BarChart3,
  Calendar,
  CheckCircle,
  ArrowRight,
  User,
  Settings,
  Eye,
  EyeOff,
  Play,
  Square,
  Sun,
  Moon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { updateElectionStatus, toggleResultVisibility } from "@/actions/auth"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"
import { getActiveElections, getCompletedElectionsWithResults, getDraftElections } from "@/services/dashboard"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function StaffDashboard({ user }: { user: any }) {
  const { toast } = useToast()
  const router = useRouter()
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
    }
  }, [user, toast])

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

  const isMobile = useMediaQuery("(max-width: 768px)")
  const [profileOpen, setProfileOpen] = useState(false)
  const { setTheme } = useTheme()

  // State for data
  const [activeElections, setActiveElections] = useState<any[]>([])
  const [completedElections, setCompletedElections] = useState<any[]>([])
  const [draftElections, setDraftElections] = useState<any[]>([])
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Loading states
  const [isLoadingActive, setIsLoadingActive] = useState(true)
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(true)
  const [isLoadingDraft, setIsLoadingDraft] = useState(true)

  // Fetch data on component mount
  useEffect(() => {
    async function fetchElectionsData() {
      try {
        // Fetch active elections
        setIsLoadingActive(true)
        const activeData = await getActiveElections(5)
        setActiveElections(activeData)
        setIsLoadingActive(false)

        // Fetch completed elections
        setIsLoadingCompleted(true)
        const completedData = await getCompletedElectionsWithResults(5)
        setCompletedElections(completedData)
        setIsLoadingCompleted(false)

        // Fetch draft elections
        setIsLoadingDraft(true)
        const draftData = await getDraftElections(5)
        setDraftElections(draftData)
        setIsLoadingDraft(false)
      } catch (error) {
        console.error("Error fetching elections data:", error)
        toast({
          title: "Error",
          description: "Failed to load elections data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchElectionsData()
  }, [toast])

  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Handle election status change
  const handleStatusChange = useCallback(
    async (electionId: string, newStatus: "draft" | "active" | "completed") => {
      setIsUpdating(electionId)
      try {
        const result = await updateElectionStatus(electionId, newStatus)
        if (result.success) {
          // Update local state to reflect the change
          if (newStatus === "active") {
            // Move from draft to active
            const electionToMove = draftElections.find((e) => e.id === electionId)
            if (electionToMove) {
              setDraftElections((prev) => prev.filter((e) => e.id !== electionId))
              setActiveElections((prev) => [{ ...electionToMove, status: "active" }, ...prev])
            }
          } else if (newStatus === "completed") {
            // Move from active to completed
            const electionToMove = activeElections.find((e) => e.id === electionId)
            if (electionToMove) {
              setActiveElections((prev) => prev.filter((e) => e.id !== electionId))
              setCompletedElections((prev) => [{ ...electionToMove, status: "completed" }, ...prev])
            }
          }

          toast({
            title: "Status Updated",
            description: `Election status changed to ${newStatus}`,
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update status",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsUpdating(null)
      }
    },
    [activeElections, draftElections, completedElections, updateElectionStatus, toast],
  )

  // Handle result visibility toggle
  const handleResultVisibilityToggle = useCallback(
    async (electionId: string, showResults: boolean) => {
      setIsUpdating(electionId)
      try {
        const result = await toggleResultVisibility(electionId, showResults)
        if (result.success) {
          // Update local state to reflect the change
          setCompletedElections((prev) =>
            prev.map((election) =>
              election.id === electionId ? { ...election, show_results: showResults } : election,
            ),
          )

          toast({
            title: "Visibility Updated",
            description: showResults ? "Results are now visible to voters" : "Results are now hidden from voters",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update visibility",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsUpdating(null)
      }
    },
    [toggleResultVisibility, toast],
  )

  // Get all elections for statistics
  const allElections = [...activeElections, ...completedElections, ...draftElections]

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/elections/manage">
                <Settings className="h-4 w-4" />
                <span>Manage Elections</span>
              </Link>
            </Button>
            <Button variant="default" size="sm" className="gap-2" asChild>
              <Link href="/elections/create">
                <PlusCircle className="h-4 w-4" />
                <span>Create Election</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Elections Management */}
          <Card className="col-span-2 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Manage Elections</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/elections/manage" className="flex items-center gap-1">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>Control election status and visibility</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-4">
                {isLoadingActive || isLoadingCompleted || isLoadingDraft ? (
                  // Skeleton loaders
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 py-2">
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="flex flex-col">
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="flex flex-col">
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 py-3 border-t bg-muted/30">
                        <div className="flex w-full justify-between items-center">
                          <Skeleton className="h-9 w-32" />
                          <Skeleton className="h-9 w-20" />
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <>
                    {/* Draft Elections */}
                    {draftElections.map((election) => (
                      <Card key={election.id} className="overflow-hidden">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{election.title}</CardTitle>
                              <CardDescription className="line-clamp-1">{election.description}</CardDescription>
                            </div>
                            <Badge className="bg-amber-500 hover:bg-amber-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              Draft
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 py-2">
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Created</span>
                              <span className="text-sm font-medium">{formatDate(election.created_at)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Type</span>
                              <span className="text-sm font-medium">{election.election_type?.name || "Standard"}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-4 py-3 border-t bg-muted/30">
                          <div className="flex w-full justify-between items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(election.id, "active")}
                              disabled={isUpdating === election.id}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start Election
                            </Button>

                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/elections/${election.id}/edit`}>
                                <Settings className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}

                    {/* Active Elections */}
                    {activeElections.map((election) => (
                      <Card key={election.id} className="overflow-hidden">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{election.title}</CardTitle>
                              <CardDescription className="line-clamp-1">{election.description}</CardDescription>
                            </div>
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 py-2">
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">End Date</span>
                              <span className="text-sm font-medium">{formatDate(election.end_date)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Total Votes</span>
                              <span className="text-sm font-medium">{election.total_votes || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-4 py-3 border-t bg-muted/30">
                          <div className="flex w-full justify-between items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(election.id, "completed")}
                              disabled={isUpdating === election.id}
                            >
                              <Square className="h-4 w-4 mr-1" />
                              End Election
                            </Button>

                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/elections/${election.id}/edit`}>
                                <Settings className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}

                    {/* Completed Elections */}
                    {completedElections.map((election) => (
                      <Card key={election.id} className="overflow-hidden">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{election.title}</CardTitle>
                              <CardDescription className="line-clamp-1">{election.description}</CardDescription>
                            </div>
                            <Badge variant="secondary">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 py-2">
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">End Date</span>
                              <span className="text-sm font-medium">{formatDate(election.end_date)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Total Votes</span>
                              <span className="text-sm font-medium">{election.total_votes || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-4 py-3 border-t bg-muted/30">
                          <div className="flex w-full justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`show-results-${election.id}`}
                                checked={election.show_results}
                                onCheckedChange={(checked) => handleResultVisibilityToggle(election.id, checked)}
                                disabled={isUpdating === election.id}
                              />
                              <Label htmlFor={`show-results-${election.id}`} className="text-sm">
                                {election.show_results ? (
                                  <span className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Results Visible
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <EyeOff className="h-4 w-4 mr-1" />
                                    Results Hidden
                                  </span>
                                )}
                              </Label>
                            </div>

                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/results/${election.id}`}>
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Results
                              </Link>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}

                    {allElections.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Vote className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No Elections Found</h3>
                        <p className="text-muted-foreground mt-1">Create your first election to get started</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Profile Card */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Staff account information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pb-2">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Staff ID: {user.studentId}</p>
              <p className="text-sm text-muted-foreground">Role: Staff</p>
              <p className="text-sm text-muted-foreground">Department: {user.department?.name || "Not assigned"}</p>

              <div className="w-full mt-6 space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/elections/create">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Election
                  </Link>
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/elections">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Elections
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Election Statistics */}
          <Card className="col-span-2 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle>Election Statistics</CardTitle>
              <CardDescription>Overview of all elections</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActive || isLoadingCompleted || isLoadingDraft ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-1">{activeElections.length}</div>
                      <div className="text-sm text-muted-foreground">Active Elections</div>
                    </div>

                    <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-blue-500 mb-1">{completedElections.length}</div>
                      <div className="text-sm text-muted-foreground">Completed Elections</div>
                    </div>

                    <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-amber-500 mb-1">{draftElections.length}</div>
                      <div className="text-sm text-muted-foreground">Draft Elections</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {allElections.slice(0, 5).map((election) => (
                          <div
                            key={election.id}
                            className="flex justify-between items-center p-3 bg-muted/20 rounded-md"
                          >
                            <div>
                              <p className="font-medium">{election.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {election.status === "active"
                                  ? "Started"
                                  : election.status === "completed"
                                    ? "Ended"
                                    : "Created"}{" "}
                                on {formatDate(election.created_at)}
                              </p>
                            </div>
                            <Badge
                              className={
                                election.status === "active"
                                  ? "bg-green-500"
                                  : election.status === "completed"
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                              }
                            >
                              {election.status}
                            </Badge>
                          </div>
                        ))}

                        {allElections.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-muted-foreground">No election activity found</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common staff tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" asChild>
                <Link href="/elections/create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Election
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/elections/drafts">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Draft Elections
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/elections/results">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Manage Results
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-6">
        {/* Header with welcome and avatar */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">Staff Dashboard</p>
          </div>
          <Avatar className="h-10 w-10 cursor-pointer" onClick={() => setProfileOpen(true)}>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Profile Settings</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <div className="flex flex-col items-center justify-center space-y-1 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">Staff • ID: {user.studentId}</p>
                  <p className="text-sm text-muted-foreground">Department: {user.department?.name || "Not assigned"}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Account</h4>
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/profile">Edit Profile</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/settings">Account Settings</Link>
                      </Button>
                    </div>
                  </div>

                  {/* Add theme toggle section here */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Theme</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="flex flex-col h-auto py-2 gap-1"
                      >
                        <Sun className="h-4 w-4" />
                        <span className="text-xs">Light</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="flex flex-col h-auto py-2 gap-1"
                      >
                        <Moon className="h-4 w-4" />
                        <span className="text-xs">Dark</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-auto py-4 flex flex-col" asChild>
            <Link href="/elections/create">
              <PlusCircle className="h-5 w-5 mb-1" />
              <span className="text-xs">Create Election</span>
            </Link>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col" asChild>
            <Link href="/elections/manage">
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs">Manage Elections</span>
            </Link>
          </Button>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Manage Elections Tab */}
          <TabsContent value="manage" className="space-y-4">
            {isLoadingActive || isLoadingCompleted || isLoadingDraft ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
            ) : (
              <>
                {/* Draft Elections */}
                {draftElections.map((election) => (
                  <Card key={election.id} className="overflow-hidden bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{election.title}</CardTitle>
                        <Badge className="bg-amber-500 text-xs">Draft</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{election.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Created</span>
                          <span className="text-xs font-medium">{formatDate(election.created_at)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Type</span>
                          <span className="text-xs font-medium">{election.election_type?.name || "Standard"}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-3 border-t bg-muted/30">
                      <div className="w-full">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleStatusChange(election.id, "active")}
                          disabled={isUpdating === election.id}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Election
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}

                {/* Active Elections */}
                {activeElections.map((election) => (
                  <Card key={election.id} className="overflow-hidden bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{election.title}</CardTitle>
                        <Badge className="bg-green-500 hover:bg-green-600 text-xs">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{election.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">End Date</span>
                          <span className="text-xs font-medium">{formatDate(election.end_date)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Total Votes</span>
                          <span className="text-xs font-medium">{election.total_votes || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-3 border-t bg-muted/30">
                      <div className="w-full">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleStatusChange(election.id, "completed")}
                          disabled={isUpdating === election.id}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          End Election
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}

                {/* Completed Elections */}
                {completedElections.map((election) => (
                  <Card key={election.id} className="overflow-hidden bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{election.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{election.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">End Date</span>
                          <span className="text-xs font-medium">{formatDate(election.end_date)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Total Votes</span>
                          <span className="text-xs font-medium">{election.total_votes || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-3 border-t bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`mobile-show-results-${election.id}`} className="text-xs">
                          Show Results
                        </Label>
                        <Switch
                          id={`mobile-show-results-${election.id}`}
                          checked={election.show_results}
                          onCheckedChange={(checked) => handleResultVisibilityToggle(election.id, checked)}
                          disabled={isUpdating === election.id}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                ))}

                {allElections.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Vote className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-medium">No Elections Found</h3>
                    <p className="text-xs text-muted-foreground mt-1">Create your first election to get started</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            {isLoadingActive || isLoadingCompleted || isLoadingDraft ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-xl font-bold">{activeElections.length}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-xl font-bold">{completedElections.length}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                          <Calendar className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="text-xl font-bold">{draftElections.length}</p>
                        <p className="text-xs text-muted-foreground">Draft</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {allElections.slice(0, 5).map((election) => (
                          <div
                            key={election.id}
                            className="flex justify-between items-center p-2 bg-muted/20 rounded-md"
                          >
                            <div>
                              <p className="text-sm font-medium">{election.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {election.status === "active"
                                  ? "Started"
                                  : election.status === "completed"
                                    ? "Ended"
                                    : "Created"}{" "}
                                on {formatDate(election.created_at)}
                              </p>
                            </div>
                            <Badge
                              className={
                                election.status === "active"
                                  ? "bg-green-500 text-xs"
                                  : election.status === "completed"
                                    ? "bg-blue-500 text-xs"
                                    : "bg-amber-500 text-xs"
                              }
                            >
                              {election.status}
                            </Badge>
                          </div>
                        ))}

                        {allElections.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-muted-foreground">No election activity found</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold">{user.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Staff ID: {user.studentId}</p>
                <p className="text-sm text-muted-foreground">Role: Staff</p>

                <div className="w-full mt-6 space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/profile">Update Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
