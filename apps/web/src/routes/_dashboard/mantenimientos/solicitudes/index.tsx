import { createFileRoute } from "@tanstack/react-router"

import { SolicitudesPage } from "@/modules/mantenimientos/solicitud/pages/SolicitudesPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/solicitudes/",
)({
  component: SolicitudesPage,
})
