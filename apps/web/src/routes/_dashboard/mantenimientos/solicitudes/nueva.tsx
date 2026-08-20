import { createFileRoute } from "@tanstack/react-router"

import { SolicitudFormPage } from "@/modules/mantenimientos/solicitud/pages/SolicitudFormPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/solicitudes/nueva",
)({
  component: SolicitudFormPage,
})
