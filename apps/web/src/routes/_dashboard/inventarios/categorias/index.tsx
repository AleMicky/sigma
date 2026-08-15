import { createFileRoute } from "@tanstack/react-router"

import { CategoriasInsumoPage } from "@/modules/inventarios/categoria-insumo/pages/CategoriasInsumoPage"

export const Route = createFileRoute("/_dashboard/inventarios/categorias/")({
  component: CategoriasInsumoPage,
})
