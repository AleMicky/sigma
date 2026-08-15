import { createFileRoute } from "@tanstack/react-router"

import { InsumoFormPage } from "@/modules/inventarios/insumo/pages/InsumoFormPage"

export const Route = createFileRoute(
  "/_dashboard/inventarios/$insumoId/editar",
)({
  component: InsumoEditarRoute,
})

function InsumoEditarRoute() {
  const { insumoId } = Route.useParams()

  return <InsumoFormPage insumoId={insumoId} />
}
