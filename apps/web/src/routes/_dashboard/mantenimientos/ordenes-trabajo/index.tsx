import { createFileRoute } from "@tanstack/react-router"

import { OrdenesTrabajoPage } from "@/modules/mantenimientos/orden-trabajo/pages/OrdenesTrabajoPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/ordenes-trabajo/",
)({
  component: OrdenesTrabajoPage,
})
