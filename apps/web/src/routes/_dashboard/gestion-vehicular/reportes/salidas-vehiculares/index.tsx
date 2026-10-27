import { createFileRoute } from "@tanstack/react-router"

import { ReportesSalidasVehicularesPage } from "@/modules/gestionvehicular/salida-vehicular/pages/ReportesSalidasVehicularesPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/reportes/salidas-vehiculares/"
)({
  component: ReportesSalidasVehicularesPage,
})
