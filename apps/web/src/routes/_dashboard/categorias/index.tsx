import { createFileRoute } from "@tanstack/react-router"

import { CategoriasPage } from "@/modules/activos/categoria/pages/CategoriasPage"

export const Route = createFileRoute("/_dashboard/categorias/")({
  component: CategoriasPage,
})
