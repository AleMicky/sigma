import { createFileRoute } from "@tanstack/react-router"

import { PlanesMantenimientoPage } from "@/modules/mantenimientos/plan-mantenimiento/pages/PlanesMantenimientoPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/planes-mantenimiento/",
)({
  component: PlanesMantenimientoPage,
})
