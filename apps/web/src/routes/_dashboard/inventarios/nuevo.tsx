import { createFileRoute } from "@tanstack/react-router"

import { InsumoFormPage } from "@/modules/inventarios/insumo/pages/InsumoFormPage"

export const Route = createFileRoute("/_dashboard/inventarios/nuevo")({
  component: InsumoNuevoRoute,
})

function InsumoNuevoRoute() {
  return <InsumoFormPage />
}
