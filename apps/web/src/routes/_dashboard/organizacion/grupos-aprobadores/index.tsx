import { createFileRoute } from "@tanstack/react-router"

import { GruposAprobadoresPage } from "@/modules/organizacion/grupo-aprobador/pages/GruposAprobadoresPage"

export const Route = createFileRoute(
  "/_dashboard/organizacion/grupos-aprobadores/",
)({
  component: GruposAprobadoresPage,
})
