import { createFileRoute } from "@tanstack/react-router"

import { TipoInsumoDetailPage } from "@/modules/inventarios/tipo-insumo/pages/TipoInsumoDetailPage"

export const Route = createFileRoute(
  "/_dashboard/inventarios/tipos-insumo/$tipoInsumoId",
)({
  component: TipoInsumoDetailRoute,
})

function TipoInsumoDetailRoute() {
  const { tipoInsumoId } = Route.useParams()

  return <TipoInsumoDetailPage tipoInsumoId={tipoInsumoId} />
}
