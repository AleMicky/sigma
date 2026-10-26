import { createFileRoute } from "@tanstack/react-router"

import { ConsumoCombustiblePage } from "@/modules/gestionvehicular/carga-combustible/pages/ConsumoCombustiblePage"

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/reportes/consumo-combustible/"
)({
  component: ConsumoCombustiblePage,
})
