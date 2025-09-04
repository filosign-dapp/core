import { SidebarTrigger } from "@/src/lib/components/ui/sidebar";

export default function DashboardNav() {
    return (
        <nav className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-8">
            <SidebarTrigger className="-ml-1" />
          </div>
        </nav>
    )
}