import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { ActivoFormPage } from "@/modules/activos/activo/pages/ActivoFormPage"

const searchSchema = z.object({
  tipoActivoId: z.string().optional(),
})

export const Route = createFileRoute("/_dashboard/activos/nuevo")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  component: ActivoNuevoRoute,
})

function ActivoNuevoRoute() {
  const { tipoActivoId } = Route.useSearch()

  return <ActivoFormPage defaultTipoActivoId={tipoActivoId} />
}
