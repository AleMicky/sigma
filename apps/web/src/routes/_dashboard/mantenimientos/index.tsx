import { createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config"

export const Route = createFileRoute("/_dashboard/mantenimientos/")({
  beforeLoad: () => {
    throw redirect({
      to: routes.mantenimientos.tiposMantenimiento,
    })
  },
})
