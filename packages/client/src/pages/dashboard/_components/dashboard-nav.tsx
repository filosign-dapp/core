import { SidebarTrigger } from "@/src/lib/components/ui/sidebar";
import { UserDropdown } from "./user-dropdown";
import { NotificationsPopover } from "./notifications-popover";
import Logo from "@/src/lib/components/custom/Logo";
import { Link } from "@tanstack/react-router";
import { Button } from "@/src/lib/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";

export default function DashboardNav() {
  return (
    <nav className="sticky top-0 bg-background/80 glass flex h-16 justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear px-8 z-50 border-b">
      <div className="flex gap-2 items-center">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <Logo
          textDelay={0.35}
          iconDelay={0.26}
          className="px-0 md:hidden"
          textClassName="text-foreground font-semibold"
        />
      </div>

      <div className="flex gap-4 items-center">
        <Link to="/dashboard/envelope/create">
          <Button variant="primary" className="gap-2 group">
            <PlusIcon
              weight="bold"
              className="group-hover:rotate-90 transition-transform duration-200"
            />
            <p className="hidden sm:inline">New Envelope</p>
          </Button>
        </Link>
        <NotificationsPopover />
        <UserDropdown />
        <SidebarTrigger className="-ml-1 md:hidden" />
      </div>
    </nav>
  );
}
