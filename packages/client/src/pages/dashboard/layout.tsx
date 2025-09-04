import { AppSidebar } from "@/src/pages/dashboard/components/sidebar/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/src/lib/components/ui/sidebar"
import DashboardNav from "./components/dashboard-nav"
import { Separator } from "@/src/lib/components/ui/separator"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Navbar */}
        <DashboardNav />

        <Separator />
        
        {/* Content */}
        <section id="dashboard-content" className="flex flex-1 flex-col gap-4 pt-8">
          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
