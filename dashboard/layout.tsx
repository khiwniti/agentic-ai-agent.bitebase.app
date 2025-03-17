import { Metadata } from "next"
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client"

export const metadata: Metadata = {
  title: "Dashboard | BiteBase",
  description: "Manage your restaurant analytics and insights",
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}

