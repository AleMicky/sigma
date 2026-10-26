import { createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/configuraciones/",
)({
  beforeLoad: () => {
    throw redirect({
      to: routes.gestionVehicular.configuraciones.conductores,
    })
  },
})
