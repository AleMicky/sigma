import { createFileRoute } from "@tanstack/react-router"

import { VehiculosPage } from "@/modules/gestionvehicular/vehiculo/pages/VehiculosPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/vehiculos/",
)({
  component: VehiculosPage,
})
