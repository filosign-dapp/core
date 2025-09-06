import { SidebarTrigger } from "@/src/lib/components/ui/sidebar";
import { UserDropdown } from "./user-dropdown";
import { Button } from "@/src/lib/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

export default function DashboardNav() {
  return (
    <nav className="sticky glass bg-background/50 top-0 flex h-16 justify-between bg shrink-0 items-center gap-2 transition-[width,height] ease-linear px-8 border-b border-border z-50">
      <div className="flex gap-2 items-center">
        <SidebarTrigger className="-ml-1" />
      </div>

      <div className="flex gap-4 items-center">
        <Link to="/dashboard/create">
          <Button variant="primary" className="gap-2">
            <PlusIcon className="size-4" weight="bold" />
            Create Envelope
          </Button>
        </Link>

        <UserDropdown />
      </div>
    </nav>
  )
}