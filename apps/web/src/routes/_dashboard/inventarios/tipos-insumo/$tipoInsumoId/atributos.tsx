import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/inventarios/tipos-insumo/$tipoInsumoId/atributos",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/inventarios/tipos-insumo",
    })
  },
})
