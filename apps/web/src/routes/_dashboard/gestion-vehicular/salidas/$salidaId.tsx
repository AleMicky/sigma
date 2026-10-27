import { createFileRoute } from "@tanstack/react-router"

import { SalidaVehicularDetailPage } from "@/modules/gestionvehicular/salida-vehicular/pages/SalidaVehicularDetailPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/salidas/$salidaId"
)({
  component: SalidaVehicularDetailPageWrapper,
})

function SalidaVehicularDetailPageWrapper() {
  const { salidaId } = Route.useParams()
  return <SalidaVehicularDetailPage salidaId={salidaId} />
}
