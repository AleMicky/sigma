import { createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config"

export const Route = createFileRoute("/_dashboard/organizacion/")({
  beforeLoad: () => {
    throw redirect({
      to: routes.organizacion.empleados,
    })
  },
})
