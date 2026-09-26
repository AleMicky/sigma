import { createFileRoute } from "@tanstack/react-router"

import { SolicitudVehicularFormPage } from "@/modules/gestionvehicular/solicitud/pages/SolicitudVehicularFormPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/solicitudes/$solicitudId/editar"
)({
  component: function SolicitudVehicularEditarRoute() {
    const { solicitudId } = Route.useParams()
    return <SolicitudVehicularFormPage solicitudId={solicitudId} />
  },
})
