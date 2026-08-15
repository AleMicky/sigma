import { createFileRoute } from "@tanstack/react-router"

import { UnidadesMedidaPage } from "@/modules/parametros/unidad-medida/pages/UnidadesMedidaPage"

export const Route = createFileRoute("/_dashboard/parametros/unidades-medida")({
  component: UnidadesMedidaPage,
})
