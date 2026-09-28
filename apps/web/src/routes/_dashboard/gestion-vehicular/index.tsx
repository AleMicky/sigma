import { createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config"

export const Route = createFileRoute("/_dashboard/gestion-vehicular/")({
  beforeLoad: () => {
    throw redirect({
      to: routes.gestionVehicular.solicitudes,
    })
  },
})
