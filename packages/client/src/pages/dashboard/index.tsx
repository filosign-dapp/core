import { NotFound } from "@/src/lib/components/custom/NotFound"
import DashboardLayout from "./layout"
import { ComingSoon } from "@/src/lib/components/custom/ComingSoon"
import { PageCrashed } from "@/src/lib/components/custom/PageCrashed"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ComingSoon />
    </DashboardLayout>
  )
}