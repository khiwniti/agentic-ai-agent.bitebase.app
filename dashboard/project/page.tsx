import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Plus, ArrowRight, MapPin, Calendar, Star, Users, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data for projects
const projects = [
  {
    id: "1",
    name: "Italian Restaurant - Downtown",
    description: "Full-service Italian restaurant in the heart of downtown",
    location: "123 Main St, Downtown",
    status: "Active",
    createdAt: "Feb 12, 2023",
    progress: 85,
    insights: 12,
    rating: 4.8
  },
  {
    id: "2",
    name: "Cafe & Bakery - Westside",
    description: "Cozy cafe with fresh pastries and specialty coffee",
    location: "456 Oak Ave, Westside",
    status: "In Progress",
    createdAt: "Mar 3, 2023",
    progress: 62,
    insights: 8,
    rating: 4.2
  },
  {
    id: "3",
    name: "Fast Casual - Northgate Mall",
    description: "Counter-service restaurant in high-traffic mall location",
    location: "789 Mall Dr, Northgate",
    status: "Planning",
    createdAt: "Apr 18, 2023",
    progress: 28,
    insights: 4,
    rating: 3.9
  },
  {
    id: "4",
    name: "Food Truck Expansion",
    description: "Analysis for adding a second food truck to existing business",
    location: "Various Locations",
    status: "Active",
    createdAt: "Jan 5, 2023",
    progress: 92,
    insights: 15,
    rating: 4.6
  }
]

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Active":
      return "bg-[#74C365]/10 text-[#74C365] border-[#74C365]"
    case "In Progress":
      return "bg-[#F4C431]/10 text-amber-700 border-[#F4C431]"
    case "Planning":
      return "bg-[#0288D1]/10 text-blue-700 border-[#0288D1]"
    default:
      return "bg-gray-100 text-gray-800 border-gray-400"
  }
}

export default function ProjectsPage() {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Projects" 
        text="Manage and analyze your restaurant projects."
      >
        <Button asChild className="gap-2 bg-[#74C365] hover:bg-[#74C365]/90">
          <Link href="/dashboard/new-project">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </DashboardHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusBadgeClass(project.status)}`}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Created: {project.createdAt}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Project Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[#74C365]"
                      style={{ 
                        width: `${project.progress}%`,
                        transition: "width 0.5s ease-out"
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Star className="h-4 w-4 text-amber-500 mb-1" />
                  <span className="text-sm font-medium">{project.rating}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="h-4 w-4 text-blue-500 mb-1" />
                  <span className="text-sm font-medium">14k</span>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowUpRight className="h-4 w-4 text-[#74C365] mb-1" />
                  <span className="text-sm font-medium">{project.insights}</span>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-1">
                <Link href={`/dashboard/project/${project.id}`}>
                  View Project <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardShell>
  )
} 