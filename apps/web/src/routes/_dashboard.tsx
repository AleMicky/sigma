import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { useAuthStore } from "@/app/store/auth.store"
import { DashboardLayout } from "@/layouts/dashboard-layout/DashboardLayout"
import { authQueries } from "@/modules/auth/api/auth.queries"

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" })
    }

    try {
      const user = await context.queryClient.ensureQueryData(
        authQueries.me(),
      )
      const { accessToken, refreshToken } = useAuthStore.getState()

      if (accessToken) {
        useAuthStore.getState().setSession({
          user,
          accessToken,
          refreshToken,
        })
      }
    } catch {
      useAuthStore.getState().clearSession()
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
