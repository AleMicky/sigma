import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { ControlActivoVehicularFormPage } from "@/modules/gestionvehicular/control-activo/pages/ControlActivoVehicularFormPage"

const searchSchema = z.object({
  id: z.string().optional(),
  solicitudId: z.string().optional(),
  activoId: z.string().optional(),
  tipo: z.enum(["ENTREGA", "DEVOLUCION"]).optional(),
})

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/controles-activos/nuevo",
)({
  validateSearch: searchSchema,
  component: ControlActivoVehicularFormPage,
})
