import { createFileRoute } from "@tanstack/react-router"

import { ReporteBitacoraPorteriaPage } from "@/modules/gestionvehicular/porteria/pages/ReporteBitacoraPorteriaPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/reportes/porteria/"
)({
  component: ReporteBitacoraPorteriaPage,
})
