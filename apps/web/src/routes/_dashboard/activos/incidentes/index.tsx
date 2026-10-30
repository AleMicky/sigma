import { createFileRoute } from "@tanstack/react-router"

import { IncidentesPage } from "@/modules/activos/incidente/pages/IncidentesPage"

export const Route = createFileRoute("/_dashboard/activos/incidentes/")({
  component: IncidentesRoute,
})

function IncidentesRoute() {
  return <IncidentesPage />
}

