import { createFileRoute } from "@tanstack/react-router"

import { TipoInsumoAtributosList } from "@/modules/inventarios/tipo-insumo-atributo/components/TipoInsumoAtributosList"

export const Route = createFileRoute(
  "/_dashboard/inventarios/tipos-insumo/$tipoInsumoId/atributos",
)({
  component: TipoInsumoAtributosRoute,
})

function TipoInsumoAtributosRoute() {
  const { tipoInsumoId } = Route.useParams()

  return <TipoInsumoAtributosList tipoInsumoId={tipoInsumoId} />
}
