import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { OrdenTrabajoFormPage } from "@/modules/mantenimientos/orden-trabajo/pages/OrdenTrabajoFormPage"

const searchSchema = z.object({
  solicitudId: z.string().optional(),
  activoId: z.string().optional(),
  responsableId: z.string().optional(),
})

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/ordenes-trabajo/nuevo",
)({
  validateSearch: (search) => searchSchema.parse(search),
  component: OrdenTrabajoFormPage,
})
