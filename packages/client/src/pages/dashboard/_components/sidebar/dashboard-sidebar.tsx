import * as React from "react"

import { NavMain } from "@/src/pages/dashboard/_components/sidebar/nav-main"
import { sidebarData } from "@/src/pages/dashboard/_components/sidebar/mock"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/src/lib/components/ui/sidebar"
import Logo from "@/src/lib/components/custom/Logo"


export function DashboardSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <>
      <Sidebar className={className} collapsible="icon" {...props}>
        <SidebarHeader>
          <Logo 
            textClassName="text-foreground font-semibold" 
            isCollapsed={isCollapsed}
            onIconClick={() => {
              if (isCollapsed) {
                setOpen(true)
              }
            }}
          />
        </SidebarHeader>
        <SidebarContent className="">
          <NavMain items={sidebarData.navMain} />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>
  )
}
