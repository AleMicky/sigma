import { createFileRoute } from "@tanstack/react-router"

import { EmpleadosPage } from "@/modules/organizacion/empleado/pages/EmpleadosPage"

export const Route = createFileRoute("/_dashboard/organizacion/empleados/")({
  component: EmpleadosPage,
})
