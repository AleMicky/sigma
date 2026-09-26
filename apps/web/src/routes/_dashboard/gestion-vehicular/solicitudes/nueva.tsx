import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { SolicitudVehicularFormPage } from "@/modules/gestionvehicular/solicitud/pages/SolicitudVehicularFormPage"

const searchSchema = z.object({
  solicitudId: z.string().optional(),
  tipo: z.string().optional(),
})

export type SolicitudVehicularNuevaSearch = z.infer<typeof searchSchema>

export const Route = createFileRoute(
  "/_dashboard/gestion-vehicular/solicitudes/nueva"
)({
  validateSearch: (search: Record<string, unknown>): SolicitudVehicularNuevaSearch =>
    searchSchema.parse(search),
  component: SolicitudVehicularFormPage,
})
