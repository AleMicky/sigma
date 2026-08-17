import { createFileRoute } from "@tanstack/react-router"

import { ActividadesPage } from "@/modules/mantenimientos/actividad/pages/ActividadesPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/actividades/",
)({
  component: ActividadesPage,
})
