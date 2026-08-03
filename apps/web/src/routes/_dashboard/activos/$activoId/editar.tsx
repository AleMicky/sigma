import { createFileRoute } from "@tanstack/react-router"

import { ActivoFormPage } from "@/modules/activos/activo/pages/ActivoFormPage"

export const Route = createFileRoute("/_dashboard/activos/$activoId/editar")({
  component: ActivoEditarRoute,
})

function ActivoEditarRoute() {
  const { activoId } = Route.useParams()

  return <ActivoFormPage activoId={activoId} />
}
