import { Badge } from "@/src/lib/components/ui/badge"
import { Input } from "@/src/lib/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select"
import {
  ClockIcon,
  CheckCircleIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  BirdIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import DashboardLayout from "./layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full rounded-tl-2xl bg-background">
        <motion.div
          className="flex justify-between items-center p-4 px-8 border-b border-border/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-3">
              <FileTextIcon className="size-10" />
              <h1 className="text-foreground">Documents</h1>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <ClockIcon className="size-4" />
                Pending 0
              </Badge>
              <Badge variant="outline" className="gap-2">
                <CheckCircleIcon className="size-4" />
                Completed 0
              </Badge>
              <Badge variant="outline" className="gap-2">
                <FileTextIcon className="size-4" />
                Draft 0
              </Badge>
            </div>
          </div>

          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="w-48" size="sm">
                <SelectValue placeholder="Sender: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="me">Me</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-48" size="sm">
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
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-10 w-64"
                size="sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <motion.div
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center space-y-4"
            >
              <div className="w-32 h-32 mx-auto mb-6">
                <BirdIcon className="w-full h-full text-muted-foreground/30" weight="duotone" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">We're all empty</h2>
              <p className="text-muted-foreground max-w-md">
                You have not yet created or received any documents. To create a document please upload one.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}