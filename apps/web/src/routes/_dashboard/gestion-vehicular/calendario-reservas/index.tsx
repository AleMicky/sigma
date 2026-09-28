import { createFileRoute } from "@tanstack/react-router"
import { CalendarioReservasPage } from "@/modules/gestionvehicular/calendario-reservas/pages/CalendarioReservasPage"

export const Route = createFileRoute("/_dashboard/gestion-vehicular/calendario-reservas/")({
  component: CalendarioReservasPage,
})
