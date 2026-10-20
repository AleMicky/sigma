import { createFileRoute } from "@tanstack/react-router"

import { ProgramacionesMantenimientoPage } from "@/modules/mantenimientos/programacion-mantenimiento/pages/ProgramacionesMantenimientoPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/programaciones-mantenimiento/",
)({
  component: ProgramacionesMantenimientoPage,
})
