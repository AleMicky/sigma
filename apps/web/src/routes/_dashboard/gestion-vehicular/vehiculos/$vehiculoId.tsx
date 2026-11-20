import { createFileRoute } from "@tanstack/react-router"

import { VehiculoDetailPage } from "@/modules/gestionvehicular/vehiculo/pages/VehiculoDetailPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/vehiculos/$vehiculoId",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { vehiculoId } = Route.useParams()
  return <VehiculoDetailPage vehiculoId={vehiculoId} />
}
