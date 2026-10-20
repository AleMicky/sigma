import { createFileRoute } from "@tanstack/react-router"

import { DisponibilidadActivosPage } from "@/modules/activos/disponibilidad/pages/DisponibilidadActivosPage"

export const Route = createFileRoute(
  "/_dashboard/activos/disponibilidad",
)({
  component: DisponibilidadActivosPage,
})
