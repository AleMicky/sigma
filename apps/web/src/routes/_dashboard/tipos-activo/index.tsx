import { createFileRoute } from "@tanstack/react-router"

import { TiposActivoPage } from "@/modules/activos/tipo-activo/pages/TiposActivoPage"

export const Route = createFileRoute("/_dashboard/tipos-activo/")({
  component: TiposActivoPage,
})
