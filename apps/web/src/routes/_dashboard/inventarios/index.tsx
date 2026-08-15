import { createFileRoute } from "@tanstack/react-router"

import { InsumosPage } from "@/modules/inventarios/insumo/pages/InsumosPage"

export const Route = createFileRoute("/_dashboard/inventarios/")({
  component: InsumosPage,
})
