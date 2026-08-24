import { createFileRoute } from "@tanstack/react-router"

import { ControlesActivosPage } from "@/modules/mantenimientos/control-activo/pages/ControlesActivosPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/controles-activos/",
)({
  component: ControlesActivosPage,
})
