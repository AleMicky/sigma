import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"

export const Route = createFileRoute("/_dashboard/parametros")({
  beforeLoad: ({ location }) => {
    if (location.pathname === routes.parametros.root) {
      throw redirect({ to: routes.parametros.gestion })
    }
  },
  component: ParametrosLayout,
})

function ParametrosLayout() {
  return <Outlet />
}
