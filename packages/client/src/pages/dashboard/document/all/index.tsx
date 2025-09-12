import { Input } from "@/src/lib/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/lib/components/ui/popover"
import { Button } from "@/src/lib/components/ui/button"
import {
  FileTextIcon,
  MagnifyingGlassIcon,
  BirdIcon,
  FunnelIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import DashboardLayout from "../../layout"

export default function DocumentAllPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full rounded-tl-2xl bg-background @container">
        <motion.div
          className="flex items-center justify-between p-4 px-8 border-b border-border/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-10" />
              <h1 className="text-foreground">Documents</h1>
            </div>
          </div>

          <div className="hidden w-full max-w-2xl gap-4 @5xl:flex">
            <Select>
              <SelectTrigger className="w-full" size="sm">
                <SelectValue placeholder="Sender: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="me">Me</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full" size="sm">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <MagnifyingGlassIcon className="absolute transform -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="w-64 pl-10"
                size="sm"
              />
            </div>
          </div>

          <div className="@5xl:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <FunnelIcon className="size-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="mt-2 w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium leading-none text-md text-foreground">Filters</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Select at least one filter</p>
                  </div>

                  <Select>
                    <SelectTrigger className="w-full" size="sm">
                      <SelectValue placeholder="Sender: All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="me">Me</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-full" size="sm">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-1">
          <motion.div
            className="flex flex-col items-center justify-center flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
              className="space-y-4 text-center"
            >
              <div className="w-32 h-32 mx-auto mb-6">
                <BirdIcon className="w-full h-full text-muted-foreground/30" weight="duotone" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">We're all empty</h2>
              <p className="max-w-md px-4 text-muted-foreground">
                You have not yet created or received any documents. To create a document please upload one.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}