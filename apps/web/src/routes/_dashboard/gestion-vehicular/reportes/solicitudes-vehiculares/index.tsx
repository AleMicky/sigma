import { createFileRoute } from "@tanstack/react-router"

import { ReportesSolicitudesVehicularesPage } from "@/modules/gestionvehicular/solicitud/pages/ReportesSolicitudesVehicularesPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/reportes/solicitudes-vehiculares/"
)({
  component: ReportesSolicitudesVehicularesPage,
})

