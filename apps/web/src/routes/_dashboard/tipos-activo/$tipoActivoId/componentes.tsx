import { createFileRoute } from "@tanstack/react-router"

import { TipoActivoComponentesPage } from "@/modules/activos/componente/pages/TipoActivoComponentesPage"

export const Route = createFileRoute(
  "/_dashboard/tipos-activo/$tipoActivoId/componentes",
)({
  component: TipoActivoComponentesRoute,
})

function TipoActivoComponentesRoute() {
  const { tipoActivoId } = Route.useParams()

  return <TipoActivoComponentesPage tipoActivoId={tipoActivoId} />
}
