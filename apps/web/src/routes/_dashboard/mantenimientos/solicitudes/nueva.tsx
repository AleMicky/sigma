import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { SolicitudFormPage } from "@/modules/mantenimientos/solicitud/pages/SolicitudFormPage"

const searchSchema = z.object({
  solicitudId: z.string().optional(),
  tipo: z.string().optional(),
})

export type SolicitudNuevaSearch = z.infer<typeof searchSchema>

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/solicitudes/nueva",
)({
  validateSearch: (search: Record<string, unknown>): SolicitudNuevaSearch =>
    searchSchema.parse(search),
  component: SolicitudFormPage,
})