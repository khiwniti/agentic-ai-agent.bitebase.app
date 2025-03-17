"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // General settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Privacy settings
  const [dataSharing, setDataSharing] = useState(true)
  const [analytics, setAnalytics] = useState(true)

  // Appearance settings
  const [theme, setTheme] = useState("light")

  const handleSaveSettings = () => {
    setSuccess(false)
    setError("")

    try {
      // In a real app, you would save these settings to your backend
      console.log({
        emailNotifications,
        marketingEmails,
        dataSharing,
        analytics,
        theme,
      })

      setSuccess(true)
    } catch (err) {
      setError("Failed to save settings. Please try again.")
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account preferences" />

      {success && (
        <Alert className="mb-4 border-green-500 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about your account activity</p>
                </div>
                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new features and promotions</p>
                </div>
                <Switch id="marketing-emails" checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-sharing">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">Allow us to use your data to improve our services</p>
                </div>
                <Switch id="data-sharing" checked={dataSharing} onCheckedChange={setDataSharing} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analytics</Label>
                  <p className="text-sm text-muted-foreground">Allow us to collect anonymous usage data</p>
                </div>
                <Switch id="analytics" checked={analytics} onCheckedChange={setAnalytics} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how BiteBase looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-4">
                    <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
                      Light
                    </Button>
                    <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
                      Dark
                    </Button>
                    <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="font-medium">Current Plan</div>
                  <div className="text-sm text-muted-foreground">Free Plan</div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Features:</span> Basic analytics, 3 projects, Standard support
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="font-medium">Payment Method</div>
                  <div className="text-sm text-muted-foreground">No payment method added</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Upgrade Plan</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

