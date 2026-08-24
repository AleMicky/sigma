import { createFileRoute } from "@tanstack/react-router"

import { EncargadoMantenimientoPage } from "@/modules/mantenimientos/solicitud/pages/EncargadoMantenimientoPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/encargado/",
)({
  component: EncargadoMantenimientoPage,
})
