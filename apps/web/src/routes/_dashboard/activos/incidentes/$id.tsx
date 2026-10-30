import { createFileRoute } from "@tanstack/react-router"

import { IncidenteDetailPage } from "@/modules/activos/incidente/pages/IncidenteDetailPage"

export const Route = createFileRoute("/_dashboard/activos/incidentes/$id")({
  component: IncidenteDetailRoute,
})

function IncidenteDetailRoute() {
  return <IncidenteDetailPage />
}

