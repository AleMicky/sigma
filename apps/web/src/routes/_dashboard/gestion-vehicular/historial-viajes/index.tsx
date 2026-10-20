import { createFileRoute } from "@tanstack/react-router"

import { HistorialViajesPage } from "@/modules/gestionvehicular/viaje-vehicular/pages/HistorialViajesPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/historial-viajes/"
)({
  component: HistorialViajesPage,
})
