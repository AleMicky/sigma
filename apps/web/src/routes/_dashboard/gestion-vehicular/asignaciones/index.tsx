import { createFileRoute } from "@tanstack/react-router"

import { AsignacionVehicularPage } from "@/modules/gestionvehicular/solicitud/pages/AsignacionVehicularPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/asignaciones/"
)({
  component: AsignacionVehicularPage,
})
