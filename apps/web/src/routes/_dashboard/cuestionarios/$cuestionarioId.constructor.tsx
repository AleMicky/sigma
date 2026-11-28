import { createFileRoute } from "@tanstack/react-router"

import { CuestionarioBuilderPage } from "@/modules/cuestionarios/pages/CuestionarioBuilderPage"

export const Route = createFileRoute(
  "/_dashboard/cuestionarios/$cuestionarioId/constructor",
)({
  component: CuestionarioBuilderRoute,
})

function CuestionarioBuilderRoute() {
  const { cuestionarioId } = Route.useParams()
  return <CuestionarioBuilderPage cuestionarioId={cuestionarioId} />
}
