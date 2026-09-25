import { createFileRoute } from "@tanstack/react-router"

import { TiposSolicitudPage } from "@/modules/gestionvehicular/tipo-solicitud/pages/TiposSolicitudPage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/tipos-solicitud/"
)({
  component: TiposSolicitudPage,
})
