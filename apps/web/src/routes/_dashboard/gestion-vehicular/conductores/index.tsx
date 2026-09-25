import { createFileRoute } from "@tanstack/react-router"

import { ConductoresPage } from "@/modules/gestionvehicular/conductor/pages/ConductoresPage"

export const Route = createFileRoute("/_dashboard/gestion-vehicular/conductores/")({
  component: ConductoresPage,
})
