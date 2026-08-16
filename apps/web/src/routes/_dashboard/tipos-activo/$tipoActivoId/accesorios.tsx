import { createFileRoute } from "@tanstack/react-router"

import { TipoActivoAccesoriosPage } from "@/modules/activos/accesorio/pages/TipoActivoAccesoriosPage"

export const Route = createFileRoute(
  "/_dashboard/tipos-activo/$tipoActivoId/accesorios",
)({
  component: TipoActivoAccesoriosRoute,
})

function TipoActivoAccesoriosRoute() {
  const { tipoActivoId } = Route.useParams()

  return <TipoActivoAccesoriosPage tipoActivoId={tipoActivoId} />
}
