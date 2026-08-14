import { createFileRoute } from "@tanstack/react-router"

import { UbicacionesPage } from "@/modules/parametros/ubicacion/pages/UbicacionesPage"

export const Route = createFileRoute("/_dashboard/parametros/ubicaciones")({
  component: UbicacionesPage,
})
