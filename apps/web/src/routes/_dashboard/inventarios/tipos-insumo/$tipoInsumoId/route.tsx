import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/inventarios/tipos-insumo/$tipoInsumoId",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/inventarios/tipos-insumo",
    })
  },
})
