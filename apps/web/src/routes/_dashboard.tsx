import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { DashboardLayout } from "@/layouts/dashboard-layout/DashboardLayout"

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
