import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { isAdminUser } from "@/shared/hooks/use-allowed-nav-items"

export const Route = createFileRoute("/_dashboard/seguridad")({
  beforeLoad: ({ context }) => {
    // Autorización por roles del cliente: los menús son solo refuerzo visual.
    // Se lee el store (fuente de verdad) para no depender de un context cacheado.
    const roles =
      useAuthStore.getState().user?.roles ?? context.auth.user?.roles ?? []

    if (!isAdminUser(roles)) {
      throw redirect({ to: routes.home, replace: true })
    }
  },
  component: SeguridadLayout,
})

function SeguridadLayout() {
  return <Outlet />
}
