import { createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/reportes/",
)({
  beforeLoad: () => {
    throw redirect({
      to: routes.gestionVehicular.reportes.historialViajes,
    })
  },
})
