import { createFileRoute } from "@tanstack/react-router"

import { SalidasVehicularesPage } from "@/modules/gestionvehicular/salida-vehicular/pages/SalidasVehicularesPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/salidas/"
)({
  component: SalidasVehicularesPage,
})
