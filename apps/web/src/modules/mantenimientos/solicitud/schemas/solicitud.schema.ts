import { z } from "zod"

export const solicitudSchema = z.object({
  titulo: z
    .string()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(150, "El título no puede superar los 150 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  activoId: z.string().min(1, "Debe seleccionar un activo"),
  tipoMantenimientoId: z.string().min(1, "Debe seleccionar un tipo de mantenimiento"),
  motivoMantenimientoId: z.string().optional().or(z.literal("")),
  prioridadId: z.string().min(1, "Debe seleccionar una prioridad"),
  solicitanteId: z.string().min(1, "Debe especificar el solicitante"),
  areaSolicitanteId: z.string().min(1, "Debe especificar el área"),
})

export type SolicitudFormValues = z.infer<typeof solicitudSchema>

export const defaultSolicitudValues: SolicitudFormValues = {
  titulo: "",
  descripcion: "",
  activoId: "",
  tipoMantenimientoId: "",
  motivoMantenimientoId: "",
  prioridadId: "",
  solicitanteId: "",
  areaSolicitanteId: "",
}
