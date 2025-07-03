import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile-form"
// Remove: import { MainLayout } from "@/components/layouts/main-layout"

export const dynamic = "force-dynamic"

export default async function SettingsPage({ searchParams }: { searchParams?: { section?: string } }) {
  const session = await getSession()

  if (!session?.isLoggedIn) {
    redirect("/")
  }

  // Only admin can access this page
  if (session.role !== "admin") {
    redirect("/dashboard")
  }

  // Determine which tab to show based on the section query parameter
  const defaultTab = searchParams?.section === "profile" ? "profile" : "general"

  return (
    // Remove the MainLayout wrapper
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Admin Settings</h1>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage general platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" defaultValue="Evotar - Blockchain Voting Platform" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    defaultValue="Secure, transparent voting powered by blockchain technology"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" defaultValue="admin@evotar.xyz" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                  </div>
                  <Switch id="maintenanceMode" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security settings for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication for all admin users
                    </p>
                  </div>
                  <Switch id="twoFactorAuth" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="failedLoginLock">Failed Login Lockout</Label>
                    <p className="text-sm text-muted-foreground">Lock accounts after 5 failed login attempts</p>
                  </div>
                  <Switch id="failedLoginLock" defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input id="sessionTimeout" type="number" defaultValue="60" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                  </div>
                  <Switch id="emailNotifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="securityAlerts">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for security-related events</p>
                  </div>
                  <Switch id="securityAlerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="systemUpdates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about system updates</p>
                  </div>
                  <Switch id="systemUpdates" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <ProfileForm user={session} />
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure advanced system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input id="apiKey" defaultValue="sk_live_51NzUBDCj5VS4BhJZU9LTAJVt5vHX" type="password" />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input id="webhookUrl" defaultValue="https://api.evotar.xyz/webhook" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debugMode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed logging for debugging purposes</p>
                  </div>
                  <Switch id="debugMode" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="destructive">Reset to Defaults</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
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
