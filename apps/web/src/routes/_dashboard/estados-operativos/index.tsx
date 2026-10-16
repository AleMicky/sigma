import { createFileRoute } from "@tanstack/react-router"

import { EstadosOperativosPage } from "@/modules/activos/estado-operativo/pages/EstadosOperativosPage"

export const Route = createFileRoute("/_dashboard/estados-operativos/")({
  component: EstadosOperativosPage,
})
