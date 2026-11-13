import { createFileRoute } from "@tanstack/react-router"

import { PorteriaPage } from "@/modules/gestionvehicular/porteria/pages/PorteriaPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/porteria/"
)({
  component: PorteriaPage,
})

