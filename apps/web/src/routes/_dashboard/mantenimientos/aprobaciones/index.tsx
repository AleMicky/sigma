import { createFileRoute } from "@tanstack/react-router"

import { AprobacionesPage } from "@/modules/mantenimientos/solicitud/pages/AprobacionesPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/aprobaciones/",
)({
  component: AprobacionesPage,
})
