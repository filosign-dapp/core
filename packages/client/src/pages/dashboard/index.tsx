import DashboardLayout from "./layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/lib/components/ui/avatar"
import { Badge } from "@/src/lib/components/ui/badge"
import { Button } from "@/src/lib/components/ui/button"
import {
  FileTextIcon,
  SignatureIcon,
  CalendarIcon,
  DotsThreeIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ClockIcon,
  TriangleIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import { Link } from "@tanstack/react-router"

const statsCards = [
  {
    title: "Documents Signed",
    value: "247",
    description: "Total this month",
    icon: FileTextIcon,
    trend: "+12.5%",
    color: "text-primary"
  },
  {
    title: "Pending Signatures",
    value: "18",
    description: "Awaiting completion",
    icon: SignatureIcon,
    trend: "-3.2%",
    color: "text-secondary-dark"
  },
  {
    title: "Active Envelopes",
    value: "42",
    description: "In progress",
    icon: CalendarIcon,
    trend: "+8.1%",
    color: "text-primary-medium"
  }
]

const recentActivity = [
  {
    id: 1,
    type: "signed",
    title: "Service Agreement - Acme Corp",
    assignee: { name: "Sarah Chen", avatar: undefined, initials: "SC" },
    dueDate: "Jan 15, 2025",
    priority: "completed",
    value: "$12,450"
  },
  {
    id: 2,
    type: "pending",
    title: "NDA - TechStart Inc",
    assignee: { name: "David Kim", avatar: undefined, initials: "DK" },
    dueDate: "Jan 18, 2025",
    priority: "urgent",
    value: "$8,200"
  },
  {
    id: 3,
    type: "review",
    title: "Partnership Agreement",
    assignee: { name: "Alex Rivera", avatar: undefined, initials: "AR" },
    dueDate: "Jan 20, 2025",
    priority: "normal",
    value: "$25,000"
  }
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full rounded-tl-2xl bg-background">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between px-8 py-6 border-b border-border"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your document signing activity</p>
          </div>
          <Link to="/dashboard/envelope/create">
            <Button variant="primary" className="gap-2">
              <FileTextIcon className="size-4" weight="bold" />
              New Envelope
            </Button>
          </Link>
        </motion.div>

        <div className="flex-1 p-8 space-y-8">
          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {statsCards.map((stat, index) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-sm font-medium">
                    {stat.title}
                  </CardDescription>
                  <stat.icon className={`size-8 ${stat.color}`} weight="duotone" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={stat.trend.startsWith('+') ? 'text-primary' : 'text-destructive'}>
                      {stat.trend}
                    </span>
                    <span>{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Document Status Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Document Status</CardTitle>
                  <CardDescription>Current signing pipeline overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">18</div>
                      <div className="text-sm text-muted-foreground">Awaiting Signatures</div>
                    </div>
                    <div className="p-4 bg-secondary/5 rounded-lg text-center">
                      <div className="text-2xl font-bold text-secondary-dark">7</div>
                      <div className="text-sm text-muted-foreground">Under Review</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium">Completed This Week</span>
                      </div>
                      <span className="text-sm font-bold">24</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-2 bg-secondary-dark rounded-full"></div>
                        <span className="text-sm font-medium">Average Completion Time</span>
                      </div>
                      <span className="text-sm font-bold">2.3 days</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="size-2 bg-primary-medium rounded-full"></div>
                        <span className="text-sm font-medium">Success Rate</span>
                      </div>
                      <span className="text-sm font-bold">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Wallet/Accounts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Wallet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">FIL Balance</span>
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>
                    <div className="text-2xl font-bold text-primary">124.85 FIL</div>
                    <div className="text-xs text-muted-foreground">≈ $892.40 USD</div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Gas Reserve</span>
                      <Badge variant="outline" className="text-xs">Reserve</Badge>
                    </div>
                    <div className="text-lg font-semibold">12.34 FIL</div>
                    <div className="text-xs text-muted-foreground">For transaction fees</div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-medium">247 signatures</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Cost/Signature</span>
                      <span className="font-medium">0.013 FIL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest document signing requests and updates</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <CaretRightIcon className="size-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {item.type === "signed" && <CheckCircleIcon className="size-6 text-primary" weight="fill" />}
                          {item.type === "pending" && <ClockIcon className="size-6 text-secondary-dark" weight="fill" />}
                          {item.type === "review" && <TriangleIcon className="size-6 text-primary-medium" weight="fill" />}
                        </div>

                        <div>
                          <p className="font-medium">{item.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="size-4">
                              <AvatarImage src={item.assignee.avatar} />
                              <AvatarFallback className="text-xs">{item.assignee.initials}</AvatarFallback>
                            </Avatar>
                            <span>{item.assignee.name}</span>
                            <span>•</span>
                            <span>{item.dueDate}</span>
                            {item.priority === "urgent" && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{item.value}</p>
                        <Button variant="ghost" size="sm">
                          <DotsThreeIcon className="size-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}