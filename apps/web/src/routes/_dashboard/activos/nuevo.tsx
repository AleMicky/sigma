import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { ActivoFormPage } from "@/modules/activos/activo/pages/ActivoFormPage"

const activoNuevoSearchSchema = z.object({
  tipoActivoId: z.string().optional(),
})

export const Route = createFileRoute("/_dashboard/activos/nuevo")({
  validateSearch: activoNuevoSearchSchema,
  component: ActivoNuevoRoute,
})

function ActivoNuevoRoute() {
  const { tipoActivoId } = Route.useSearch()

  return <ActivoFormPage defaultTipoActivoId={tipoActivoId} />
}