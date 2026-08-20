import { createFileRoute } from "@tanstack/react-router"

import { SolicitudFormPage } from "@/modules/mantenimientos/solicitud/pages/SolicitudFormPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/solicitudes/$solicitudId/editar",
)({
  component: SolicitudEditarRoute,
})

function SolicitudEditarRoute() {
  const { solicitudId } = Route.useParams()

  return <SolicitudFormPage solicitudId={solicitudId} />
}
