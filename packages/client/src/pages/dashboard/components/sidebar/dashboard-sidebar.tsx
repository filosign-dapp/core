import * as React from "react"

import { NavMain } from "@/src/pages/dashboard/components/sidebar/nav-main"
import { TeamSwitcher } from "@/src/pages/dashboard/components/sidebar/team-switcher"
import { sidebarData } from "@/src/pages/dashboard/components/sidebar/mock"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/src/lib/components/ui/sidebar"
import Logo from "@/src/lib/components/custom/Logo"


export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <Logo 
            textClassName="text-foreground font-bold" 
            isCollapsed={isCollapsed}
            onIconClick={() => {
              if (isCollapsed) {
                setOpen(true)
              }
            }}
          />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={sidebarData.navMain} />
        </SidebarContent>
        <SidebarFooter>
          <TeamSwitcher orgs={sidebarData.orgs} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  )
}
