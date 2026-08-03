import { createFileRoute } from "@tanstack/react-router"

import { TipoActivoComponentesPage } from "@/modules/activos/tipo-activo/pages/TipoActivoComponentesPage"

export const Route = createFileRoute(
  "/_dashboard/tipos-activo/$tipoActivoId/componentes",
)({
  component: TipoActivoComponentesPage,
})
