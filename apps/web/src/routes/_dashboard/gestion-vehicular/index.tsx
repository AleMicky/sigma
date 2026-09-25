import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/gestion-vehicular/")({
  beforeLoad: () => {
    throw redirect({ to: "/gestion-vehicular/conductores" })
  },
})
