import { createFileRoute } from "@tanstack/react-router"

import { CatalogosPage } from "@/modules/parametros/pages/CatalogosPage"

export const Route = createFileRoute("/_dashboard/parametros/catalogos")({
  component: CatalogosPage,
})
