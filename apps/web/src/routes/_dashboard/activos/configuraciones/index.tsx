import { createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"

export const Route = createFileRoute("/_dashboard/activos/configuraciones/")({
  beforeLoad: () => {
    throw redirect({
      to: routes.activos.configuraciones.tiposActivo,
    })
  },
})
