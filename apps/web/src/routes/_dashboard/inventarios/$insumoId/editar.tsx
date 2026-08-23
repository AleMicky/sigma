import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/inventarios/$insumoId/editar",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/inventarios",
    })
  },
})
