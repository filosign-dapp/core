import { CaretRightIcon } from "@phosphor-icons/react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/lib/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/src/lib/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { state, setOpen } = useSidebar()

  const handleIconClick = () => {
    if (state === "collapsed") {
      setOpen(true)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>E-Sign Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip={item.title}
                  onClick={handleIconClick}
                  className="cursor-pointer"
                >
                  {item.icon && (
                    <item.icon 
                      className="size-6 group-data-[collapsible=icon]:size-6 group-data-[collapsible=offcanvas]:size-7.5" 
                    />
                  )}
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                  <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
