import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/tipos-activo/$tipoActivoId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/tipos-activo/$tipoActivoId/atributos",
      params: { tipoActivoId: params.tipoActivoId },
    })
  },
})
