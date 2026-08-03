import { createFileRoute } from "@tanstack/react-router"

import { TipoActivoDetailPage } from "@/modules/activos/tipo-activo/pages/TipoActivoDetailPage"

export const Route = createFileRoute("/_dashboard/tipos-activo/$tipoActivoId")({
  component: TipoActivoDetailRoute,
})

function TipoActivoDetailRoute() {
  const { tipoActivoId } = Route.useParams()

  return <TipoActivoDetailPage tipoActivoId={tipoActivoId} />
}
