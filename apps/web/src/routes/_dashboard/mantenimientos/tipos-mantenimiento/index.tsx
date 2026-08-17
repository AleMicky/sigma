import { createFileRoute } from "@tanstack/react-router"

import { TiposMantenimientoPage } from "@/modules/mantenimientos/tipo-mantenimiento/pages/TiposMantenimientoPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/tipos-mantenimiento/",
)({
  component: TiposMantenimientoPage,
})
