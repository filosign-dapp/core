import DashboardLayout from "./layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full rounded-tl-2xl bg-background justify-center items-center">
        <h1>Dashboard</h1>
        <p>Welcome to the filosign dashboard.</p>
      </div>
    </DashboardLayout>
  )
}