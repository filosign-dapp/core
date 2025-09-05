import { SidebarTrigger } from "@/src/lib/components/ui/sidebar";
import { UserDropdown } from "./user-dropdown";

export default function DashboardNav() {
    return (
        <nav className="flex h-16 justify-between bg-background shrink-0 items-center gap-2 transition-[width,height] ease-linear px-8 border-b border-border">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>

          <div className="flex items-center gap-2">
            <UserDropdown />
          </div>
        </nav>
    )
}