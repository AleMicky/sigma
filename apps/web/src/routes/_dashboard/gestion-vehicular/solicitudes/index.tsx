import { createFileRoute } from "@tanstack/react-router"

import { SolicitudesVehicularesPage } from "@/modules/gestionvehicular/solicitud/pages/SolicitudesVehicularesPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/solicitudes/"
)({
  component: SolicitudesVehicularesPage,
})
