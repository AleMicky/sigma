import { createFileRoute } from "@tanstack/react-router"

import { TiposInsumoPage } from "@/modules/inventarios/tipo-insumo/pages/TiposInsumoPage"

export const Route = createFileRoute("/_dashboard/inventarios/tipos-insumo/")({
  component: TiposInsumoPage,
})
