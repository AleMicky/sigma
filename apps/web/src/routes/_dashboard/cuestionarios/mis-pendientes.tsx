import { createFileRoute } from "@tanstack/react-router"

import { MisCuestionariosPendientesPage } from "@/modules/cuestionarios/pages/MisCuestionariosPendientesPage"

export const Route = createFileRoute(
  "/_dashboard/cuestionarios/mis-pendientes",
)({
  component: MisCuestionariosPendientesPage,
})
