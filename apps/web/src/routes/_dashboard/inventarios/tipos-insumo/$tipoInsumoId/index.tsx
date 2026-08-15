import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/inventarios/tipos-insumo/$tipoInsumoId/",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/inventarios/tipos-insumo/$tipoInsumoId/atributos",
      params: { tipoInsumoId: params.tipoInsumoId },
    })
  },
})
