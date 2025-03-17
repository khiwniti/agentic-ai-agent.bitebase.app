"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  FileText, 
  Download, 
  Clock, 
  Calendar, 
  Settings, 
  Printer, 
  Mail, 
  Share2, 
  Plus, 
  Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StaggeredFade } from "@/components/animations/staggered-fade"
import { SlideIn } from "@/components/animations/slide-in"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Reports" 
        text="Generate and manage all your business reports."
      >
        <Button className="gap-2 bg-[#74C365] hover:bg-[#74C365]/90">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </DashboardHeader>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search reports..."
            className="w-full md:w-[200px]"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <StaggeredFade className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Monthly Performance Summary</CardTitle>
                  <Badge variant="outline" className="text-xs bg-[#F4C431]/10 text-[#1A1A1A] border-[#F4C431]">
                    Scheduled
                  </Badge>
                </div>
                <CardDescription>Comprehensive overview of all business metrics</CardDescription>
              </div>
              <Select defaultValue="june23">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june23">June 2023</SelectItem>
                  <SelectItem value="may23">May 2023</SelectItem>
                  <SelectItem value="april23">April 2023</SelectItem>
                  <SelectItem value="q2_23">Q2 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">Report Sections</div>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#74C365]" />
                    <span>Financial Performance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#74C365]" />
                    <span>Menu Analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#74C365]" />
                    <span>Customer Demographics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#74C365]" />
                    <span>Operational Efficiency</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#74C365]" />
                    <span>Staff Performance</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Last Generated</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>July 3, 2023</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>9:32 AM</span>
                </div>
                <div className="text-sm font-medium mt-4">Schedule</div>
                <div className="text-sm text-muted-foreground">Monthly (1st of each month)</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Recipients</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    John Doe
                    <span className="text-muted-foreground">(Owner)</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Sarah Smith
                    <span className="text-muted-foreground">(Manager)</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Finance Team
                    <span className="text-muted-foreground">(3)</span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="gap-1 mr-2">
                <Settings className="h-4 w-4" />
                Configure
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                View
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="sm" className="gap-1 bg-[#74C365] hover:bg-[#74C365]/90">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {reportsData.map((report, index) => (
          <SlideIn 
            key={report.title}
            direction="up"
            delay={index * 0.1}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{report.title}</CardTitle>
                      {report.badge && (
                        <Badge variant="outline" className={`text-xs ${getBadgeClass(report.badge)}`}>
                          {report.badge}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                  {report.hasPeriodSelector && (
                    <Select defaultValue="current">
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Period</SelectItem>
                        <SelectItem value="previous">Previous Period</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Report Details</div>
                    <ul className="space-y-1 text-sm">
                      {report.sections.map((section, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-[#74C365]" />
                          <span>{section}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Last Generated</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{report.lastGenerated.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{report.lastGenerated.time}</span>
                    </div>
                    {report.schedule && (
                      <>
                        <div className="text-sm font-medium mt-4">Schedule</div>
                        <div className="text-sm text-muted-foreground">{report.schedule}</div>
                      </>
                    )}
                  </div>
                  
                  {report.recipients && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recipients</div>
                      <div className="flex flex-wrap gap-2">
                        {report.recipients.map((recipient, i) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-1">
                            {recipient.name}
                            <span className="text-muted-foreground">({recipient.role})</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div className="flex items-center">
                  <Button variant="outline" size="sm" className="gap-1 mr-2">
                    <Settings className="h-4 w-4" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    View
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="gap-1 bg-[#74C365] hover:bg-[#74C365]/90">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </SlideIn>
        ))}
        
        <SlideIn direction="up" delay={0.5}>
          <div className="border border-dashed rounded-lg p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Create Custom Report</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Build a custom report with the exact metrics you need
            </p>
            <Button className="mt-4 bg-[#74C365] hover:bg-[#74C365]/90">
              Start Building
            </Button>
          </div>
        </SlideIn>
      </StaggeredFade>
    </DashboardShell>
  )
}

const reportsData = [
  {
    title: "Sales Performance by Category",
    description: "Breakdown of sales performance by menu category",
    badge: "Custom",
    hasPeriodSelector: true,
    sections: [
      "Category Revenue Breakdown",
      "Year-over-Year Comparison",
      "Top Performing Items",
      "Growth Trends",
      "Price Point Analysis"
    ],
    lastGenerated: {
      date: "June 28, 2023",
      time: "2:15 PM"
    },
    recipients: [
      { name: "Marketing Team", role: "4" },
      { name: "Menu Development", role: "2" }
    ]
  },
  {
    title: "Weekly Staff Performance",
    description: "Employee productivity and performance metrics",
    badge: "Scheduled",
    hasPeriodSelector: true,
    sections: [
      "Staff Hours & Costs",
      "Sales per Employee",
      "Tip Distribution",
      "Efficiency Metrics",
      "Employee Rankings"
    ],
    lastGenerated: {
      date: "June 25, 2023",
      time: "8:00 AM"
    },
    schedule: "Weekly (Mondays at 8:00 AM)",
    recipients: [
      { name: "Operations Manager", role: "Manager" },
      { name: "HR Department", role: "2" }
    ]
  },
  {
    title: "Inventory Valuation",
    description: "Current inventory status and valuation",
    badge: "On Demand",
    hasPeriodSelector: false,
    sections: [
      "Inventory Summary",
      "Category Breakdown",
      "Value Changes",
      "Stock Levels",
      "Reorder Recommendations"
    ],
    lastGenerated: {
      date: "June 22, 2023",
      time: "4:45 PM"
    }
  }
]

function getBadgeClass(badgeType: string) {
  switch (badgeType) {
    case "Scheduled":
      return "bg-[#F4C431]/10 text-[#1A1A1A] border-[#F4C431]"
    case "Custom":
      return "bg-[#74C365]/10 text-[#1A1A1A] border-[#74C365]"
    case "On Demand":
      return "bg-[#0288D1]/10 text-[#1A1A1A] border-[#0288D1]"
    default:
      return "bg-muted text-muted-foreground"
  }
} 