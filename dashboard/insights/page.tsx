"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  ArrowRight, 
  Download,
  Plus,
  Lightbulb
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StaggeredFade } from "@/components/animations/staggered-fade"
import { SlideIn } from "@/components/animations/slide-in"
import { EmptyState } from "@/components/ui/empty-state"

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("business")

  // In a real app, you would fetch this from your API
  const hasProjects = false // This would be determined by checking if the user has any projects

  if (!hasProjects) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Business Insights"
          text="Discover actionable insights to grow your restaurant business."
        />
        <EmptyState
          icon={<Lightbulb className="h-8 w-8 text-muted-foreground" />}
          title="No insights available"
          description="Create a project first to start receiving personalized business insights."
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
        heading="Business Insights" 
        text="Discover actionable insights to grow your restaurant business."
      >
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Insights
        </Button>
      </DashboardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-fit">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business" className="space-y-6">
          <StaggeredFade className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Revenue Growth"
              value="+12.5"
              unit="%"
              change={8.3}
              description="Month over month growth"
            />
            <MetricCard
              title="Profit Margin"
              value="24.8"
              unit="%"
              change={3.4}
              description="2.1% above industry average"
            />
            <MetricCard
              title="Average Order Value"
              value="$32.75"
              change={1.2}
              description="Week over week"
            />
            <MetricCard
              title="Cost of Goods"
              value="31.2"
              unit="%"
              change={-2.5}
              description="Reduced from 33.7%"
            />
          </StaggeredFade>
          
          <div className="grid gap-6 md:grid-cols-2">
            <SlideIn direction="left" className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-[#74C365]" />
                      Revenue Trends
                    </CardTitle>
                    <Button variant="ghost" className="h-8 px-2 text-xs">
                      View Details
                    </Button>
                  </div>
                  <CardDescription>Monthly revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end space-x-2">
                    {monthlyRevenue.map((month, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-[#74C365]/80 rounded-t-sm" 
                          style={{ 
                            height: `${(month.value / Math.max(...monthlyRevenue.map(m => m.value))) * 170}px`,
                            transition: "height 0.5s ease-out"
                          }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{month.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
                    <div className="rounded-md border p-2">
                      <p className="text-muted-foreground text-xs">Best Day</p>
                      <p className="font-medium">Saturday (+32%)</p>
                    </div>
                    <div className="rounded-md border p-2">
                      <p className="text-muted-foreground text-xs">Peak Hours</p>
                      <p className="font-medium">6PM - 8PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
            
            <SlideIn direction="right" delay={0.2} className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-[#74C365]" />
                      Sales Categories
                    </CardTitle>
                    <Button variant="ghost" className="h-8 px-2 text-xs">
                      View Details
                    </Button>
                  </div>
                  <CardDescription>Performance by menu category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesCategories.map((category, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">${category.sales.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[#74C365]"
                            style={{ 
                              width: `${(category.sales / Math.max(...salesCategories.map(c => c.sales))) * 100}%`,
                              transition: "width 0.5s ease-out"
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{category.growth > 0 ? `+${category.growth}%` : `${category.growth}%`}</span>
                          <span>{category.profit}% profit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Insight:</p>
                        <p className="text-xs text-muted-foreground">Craft cocktails category shows highest growth potential</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        Take Action <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
            
            <SlideIn direction="up" delay={0.3} className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-[#74C365]" />
                    Business Opportunities
                  </CardTitle>
                  <CardDescription>AI-powered recommendations to increase profitability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {opportunities.map((item, index) => (
                      <div key={index} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#74C365]/10">
                            <item.icon className="h-4 w-4 text-[#74C365]" />
                          </div>
                          <h3 className="font-medium text-sm">{item.title}</h3>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs font-medium text-[#E23D28]">+${item.potentialValue}k</span>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <StaggeredFade className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="New Customers"
              value="345"
              change={12.4}
              description="Last 30 days"
            />
            <MetricCard
              title="Repeat Rate"
              value="42"
              unit="%"
              change={3.8}
              description="5% above target"
            />
            <MetricCard
              title="Churn Rate"
              value="8.2"
              unit="%"
              change={-2.1}
              description="Improved from 10.3%"
            />
            <MetricCard
              title="Avg. Customer Value"
              value="$285"
              change={7.5}
              description="Last 90 days"
            />
            
            {/* Additional customer insights would go here */}
          </StaggeredFade>
        </TabsContent>
        
        <TabsContent value="operations" className="space-y-4">
          <StaggeredFade className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Table Turnover"
              value="1.8"
              unit="hrs"
              change={-8.3}
              description="Improved efficiency"
            />
            <MetricCard
              title="Food Waste"
              value="4.2"
              unit="%"
              change={-15.6}
              description="Reduced by 2.1%"
            />
            <MetricCard
              title="Staff Efficiency"
              value="92"
              unit="%"
              change={3.4}
              description="Orders/staff hour"
            />
            <MetricCard
              title="Kitchen Time"
              value="18.5"
              unit="min"
              change={-6.8}
              description="Avg. prep time"
            />
            
            {/* Additional operations insights would go here */}
          </StaggeredFade>
        </TabsContent>
        
        <TabsContent value="marketing" className="space-y-4">
          <StaggeredFade className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Marketing ROI"
              value="3.8"
              unit="x"
              change={18.7}
              description="Return on ad spend"
            />
            <MetricCard
              title="Social Engagement"
              value="12.4"
              unit="k"
              change={32.6}
              description="Interactions"
            />
            <MetricCard
              title="Email Open Rate"
              value="28.5"
              unit="%"
              change={4.2}
              description="5% above industry avg"
            />
            <MetricCard
              title="Promotion Usage"
              value="42"
              unit="%"
              change={7.8}
              description="Coupon redemption"
            />
            
            {/* Additional marketing insights would go here */}
          </StaggeredFade>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

const monthlyRevenue = [
  { label: "Jan", value: 42000 },
  { label: "Feb", value: 39000 },
  { label: "Mar", value: 45000 },
  { label: "Apr", value: 48000 },
  { label: "May", value: 51000 },
  { label: "Jun", value: 60000 },
]

const salesCategories = [
  { name: "Main Courses", sales: 28500, growth: 12, profit: 32 },
  { name: "Appetizers", sales: 12800, growth: 8, profit: 45 },
  { name: "Craft Cocktails", sales: 18200, growth: 24, profit: 68 },
  { name: "Desserts", sales: 8600, growth: -3, profit: 52 },
  { name: "Wine & Beer", sales: 15400, growth: 5, profit: 58 },
]

const opportunities = [
  {
    title: "Happy Hour Extension",
    description: "Extending happy hour on Tuesdays and Wednesdays could increase weekly revenue by 8%",
    icon: Clock,
    potentialValue: 12.5
  },
  {
    title: "Menu Price Optimization",
    description: "Adjusting prices on 5 high-margin items could improve overall profit margin",
    icon: ShoppingBag,
    potentialValue: 18.2
  },
  {
    title: "Seasonal Promotion",
    description: "Launching a summer seasonal menu could attract 22% more customers",
    icon: Calendar,
    potentialValue: 15.8
  }
] 