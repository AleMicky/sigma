import { createFileRoute } from "@tanstack/react-router"

import { SupervisorMantenimientoPage } from "@/modules/mantenimientos/solicitud/pages/SupervisorMantenimientoPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/supervisor/",
)({
  component: SupervisorMantenimientoPage,
})
