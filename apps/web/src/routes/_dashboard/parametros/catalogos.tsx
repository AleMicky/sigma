import { createFileRoute } from "@tanstack/react-router"

import { CatalogosPage } from "@/modules/parametros/catalogo/pages/CatalogosPage"

export const Route = createFileRoute("/_dashboard/parametros/catalogos")({
  component: CatalogosPage,
})
