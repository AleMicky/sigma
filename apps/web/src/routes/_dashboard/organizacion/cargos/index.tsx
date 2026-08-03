import { createFileRoute } from "@tanstack/react-router"

import { CargosPage } from "@/modules/organizacion/cargo/pages/CargosPage"

export const Route = createFileRoute("/_dashboard/organizacion/cargos/")({
  component: CargosPage,
})
