import { createFileRoute } from "@tanstack/react-router"

import { ConductorViajesPage } from "@/modules/gestionvehicular/solicitud/pages/ConductorViajesPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/mis-viajes/"
)({
  component: ConductorViajesPage,
})
