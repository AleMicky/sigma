import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/activos/$activoId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/activos/catalogo/$activoId",
      params: { activoId: params.activoId },
    })
  },
})

