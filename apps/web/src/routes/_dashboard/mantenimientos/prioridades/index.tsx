import { createFileRoute } from "@tanstack/react-router"

import { PrioridadesPage } from "@/modules/mantenimientos/prioridad/pages/PrioridadesPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/prioridades/",
)({
  component: PrioridadesPage,
})
