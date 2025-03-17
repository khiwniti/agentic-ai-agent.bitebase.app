"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, LineChart, Plus, RefreshCw } from "lucide-react"
import { SalesChart } from "@/components/analytics/sales-chart"
import { CustomerChart } from "@/components/analytics/customer-chart"
import { InventoryTable } from "@/components/analytics/inventory-table"
import { StaffPerformance } from "@/components/analytics/staff-performance"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { EmptyState } from "@/components/ui/empty-state"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const [selectedLocation, setSelectedLocation] = useState("1") // Default to first restaurant ID
  const [isRefreshing, setIsRefreshing] = useState(false)

  // In a real app, you would fetch this from your API
  const hasProjects = false // This would be determined by checking if the user has any projects

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // In a real app, you would refresh the data here
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  if (!hasProjects) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Analytics"
          text="Track and analyze your restaurant's performance."
        />
        <EmptyState
          icon={<LineChart className="h-8 w-8 text-muted-foreground" />}
          title="No analytics data available"
          description="Create a project first to start tracking your restaurant's performance."
          action={{
            label: "Create Project",
            href: "/dashboard/project/new",
            icon: <Plus className="h-4 w-4" />
          }}
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Analytics"
        text="Track and analyze your restaurant's performance."
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <DateRangePicker value={dateRange} onValueChange={setDateRange} />
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Basil Thai Kitchen</SelectItem>
              <SelectItem value="2">Mango Tree</SelectItem>
              <SelectItem value="3">La Boulange</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <div className="flex items-center">
              <span className="text-xs text-green-500">+20.1%</span>
              <span className="ml-1 text-xs text-muted-foreground">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28.14</div>
            <div className="flex items-center">
              <span className="text-xs text-green-500">+2.5%</span>
              <span className="ml-1 text-xs text-muted-foreground">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,842</div>
            <div className="flex items-center">
              <span className="text-xs text-green-500">+12.3%</span>
              <span className="ml-1 text-xs text-muted-foreground">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.4%</div>
            <div className="flex items-center">
              <span className="text-xs text-red-500">+1.2%</span>
              <span className="ml-1 text-xs text-muted-foreground">from previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="mt-6 space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Daily revenue breakdown by category</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SalesChart restaurantId={Number.parseInt(selectedLocation)} days={30} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Insights</CardTitle>
                  <CardDescription>Customer demographics and behavior</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CustomerChart restaurantId={Number.parseInt(selectedLocation)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Current stock levels and usage</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <InventoryTable restaurantId={Number.parseInt(selectedLocation)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Performance</CardTitle>
                  <CardDescription>Employee productivity and metrics</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StaffPerformance restaurantId={Number.parseInt(selectedLocation)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

