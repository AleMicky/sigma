import { createFileRoute } from "@tanstack/react-router"

import { BitacoraVehicularPage } from "@/modules/gestionvehicular/bitacora/pages/BitacoraVehicularPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/bitacora/"
)({
  component: BitacoraVehicularPage,
})
