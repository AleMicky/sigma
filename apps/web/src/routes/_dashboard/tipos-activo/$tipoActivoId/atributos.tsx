import { createFileRoute } from "@tanstack/react-router"

import { TipoActivoAtributosPage } from "@/modules/activos/activo-atributo/pages/TipoActivoAtributosPage"

export const Route = createFileRoute(
  "/_dashboard/tipos-activo/$tipoActivoId/atributos",
)({
  component: TipoActivoAtributosRoute,
})

function TipoActivoAtributosRoute() {
  const { tipoActivoId } = Route.useParams()

  return <TipoActivoAtributosPage tipoActivoId={tipoActivoId} />
}
