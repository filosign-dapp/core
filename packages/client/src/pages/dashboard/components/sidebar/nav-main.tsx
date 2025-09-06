import * as React from "react"
import { CaretRightIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  SidebarGroup,
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
  const isCollapsed = state === "collapsed"
  const [openItems, setOpenItems] = React.useState<Set<string>>(
    new Set(items.filter(item => item.isActive).map(item => item.title))
  )

  // Collapse all items when sidebar collapses
  React.useEffect(() => {
    if (state === "collapsed") {
      setOpenItems(new Set())
    }
  }, [state])

  const handleIconClick = () => {
    if (state === "collapsed") {
      setOpen(true)
    }
  }

  const toggleItem = (title: string) => {
    setOpenItems(prev => {
      const newSet = new Set<string>()
      if (!prev.has(title)) {
        newSet.add(title)
      }
      return newSet
    })
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isOpen = openItems.has(item.title)
          
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                size="lg"
                onClick={() => {
                  handleIconClick()
                  if (item.items && item.items.length > 0) {
                    toggleItem(item.title)
                  }
                }}
                className="cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-accent/50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:shadow-sm"
                isActive={item.isActive}
              >
                {item.icon && (
                  <item.icon 
                    className="!size-6 group-data-[collapsible=icon]:!size-6" 
                  />
                )}
                {!isCollapsed && (
                  <motion.span 
                    className="group-data-[collapsible=icon]:hidden"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 230,
                      damping: 25,
                      delay: 0.1
                    }}
                  >
                    {item.title}
                  </motion.span>
                )}
                {item.items && item.items.length > 0 && (
                  <CaretRightIcon 
                    className={`ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden ${
                      isOpen ? 'rotate-90' : ''
                    }`} 
                  />
                )}
              </SidebarMenuButton>
              
              {item.items && item.items.length > 0 && (
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <SidebarMenuSub className="mt-1">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild
                              className="text-sm font-medium transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:font-semibold px-5 py-2"
                            >
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
