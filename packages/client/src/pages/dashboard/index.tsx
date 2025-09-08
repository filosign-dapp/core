import { Link } from "@tanstack/react-router"
import { Button } from "@/src/lib/components/ui/button"
import DashboardLayout from "./layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-full">
        <Link to="/dashboard/signature/create">
          <Button variant="primary" className="gap-2">
            Create Signature
          </Button>
        </Link>
      </div>
    </DashboardLayout>
  )
}