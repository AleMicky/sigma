import { createFileRoute } from "@tanstack/react-router"

import { ResponsabilidadesPage } from "@/modules/organizacion/responsabilidad/pages/ResponsabilidadesPage"

export const Route = createFileRoute(
  "/_dashboard/organizacion/responsabilidades/",
)({
  component: ResponsabilidadesPage,
})
