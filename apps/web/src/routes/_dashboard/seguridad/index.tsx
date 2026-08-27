import { createFileRoute, redirect } from "@tanstack/react-router"

import { routes } from "@/app/config"

export const Route = createFileRoute("/_dashboard/seguridad/")({
  beforeLoad: () => {
    throw redirect({
      to: routes.seguridad.usuarios,
    })
  },
})
