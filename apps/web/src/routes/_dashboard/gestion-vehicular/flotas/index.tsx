import { createFileRoute } from "@tanstack/react-router"

import { FlotasPage } from "@/modules/gestionvehicular/flota-vehicular/pages/FlotasPage"

export const Route = createFileRoute("/_dashboard/gestion-vehicular/flotas/")({
  component: FlotasPage,
})
