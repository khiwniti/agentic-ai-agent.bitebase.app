import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WelcomeExperience } from "@/components/dashboard/welcome-experience"
import { EmptyState } from "@/components/ui/empty-state"
import { Building2, Plus } from "lucide-react"

// Mock data to avoid database calls during initial render
const mockProjects = [
  {
    id: "proj_1",
    name: "Italian Restaurant - Downtown",
    description: "Full-service Italian restaurant in the heart of downtown",
    status: "active",
  },
  {
    id: "proj_2",
    name: "Cafe & Bakery - Westside",
    description: "Cozy cafe with fresh pastries and specialty coffee",
    status: "planning",
  },
  {
    id: "proj_3",
    name: "Fast Casual - Northgate Mall",
    description: "Counter-service restaurant in high-traffic mall location",
    status: "active",
  },
];

// Loading components
function DashboardSectionLoading({ height = "300px", label = "Loading..." }) {
  return (
    <Card className={`h-[${height}] flex items-center justify-center`}>
      <div className="animate-pulse text-center">
        <p>{label}</p>
      </div>
    </Card>
  );
}

// Server-side auth check then client-side rendering
export default async function DashboardPage() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // In a real app, you would fetch this from your API
    const hasProjects = false // This would be determined by checking if the user has any projects
    const isNewUser = true // This would be determined by checking user metadata/onboarding status
    
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Dashboard"
          text={isNewUser ? "Welcome! Let's get started with your first project." : "Your restaurant analytics at a glance."}
        />
        
        <Suspense fallback={<DashboardSectionLoading />}>
          {isNewUser ? (
            <WelcomeExperience />
          ) : hasProjects ? (
            <div className="grid gap-4">
              {/* Your existing dashboard content would go here */}
              <p className="text-muted-foreground">Loading project data...</p>
            </div>
          ) : (
            <EmptyState
              icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
              title="No projects yet"
              description="Create your first project to start analyzing restaurant locations."
              action={{
                label: "Create Project",
                href: "/dashboard/project/new",
                icon: <Plus className="h-4 w-4" />
              }}
            />
          )}
        </Suspense>
      </DashboardShell>
    );
  } catch (error) {
    console.error("Dashboard auth error:", error);
    redirect("/login");
  }
}

const topSellingItems = [
  { name: "Margherita Pizza", category: "Main Course", revenue: 12450, growth: 8.5 },
  { name: "Tiramisu", category: "Dessert", revenue: 8320, growth: 12.3 },
  { name: "Spaghetti Carbonara", category: "Main Course", revenue: 7840, growth: -2.1 },
  { name: "Espresso Martini", category: "Cocktails", revenue: 6920, growth: 24.8 },
  { name: "Bruschetta", category: "Appetizer", revenue: 5840, growth: 3.2 },
]

