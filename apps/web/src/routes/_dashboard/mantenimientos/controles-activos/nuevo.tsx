import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { ControlActivoFormPage } from "@/modules/mantenimientos/control-activo/pages/ControlActivoFormPage"

const searchSchema = z.object({
  id: z.string().optional(),
  solicitudId: z.string().optional(),
  tipo: z.enum(["ENTREGA", "DEVOLUCION"]).optional(),
})

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/controles-activos/nuevo",
)({
  validateSearch: (search) => searchSchema.parse(search),
  component: ControlActivoFormPage,
})
