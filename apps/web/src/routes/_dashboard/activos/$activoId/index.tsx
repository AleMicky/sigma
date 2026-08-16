import { createFileRoute } from "@tanstack/react-router"

import { ActivoDetailPage } from "@/modules/activos/activo/pages/ActivoDetailPage"

export const Route = createFileRoute("/_dashboard/activos/$activoId/")({
  component: ActivoDetailRoute,
})

function ActivoDetailRoute() {
  const { activoId } = Route.useParams()

  return <ActivoDetailPage activoId={activoId} />
}
