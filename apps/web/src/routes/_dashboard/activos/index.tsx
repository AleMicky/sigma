import { createFileRoute } from "@tanstack/react-router"

import { ActivosPage } from "@/modules/activos/activo/pages/ActivosPage"

export const Route = createFileRoute("/_dashboard/activos/")({
  component: ActivosPage,
})
