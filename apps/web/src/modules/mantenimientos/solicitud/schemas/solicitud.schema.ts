import { z } from "zod"

export const solicitudSchema = z.object({
  titulo: z
    .string()
    .min(1, "El título es obligatorio")
    .max(150, "El título no puede superar los 150 caracteres"),
  descripcion: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(2000, "La descripción no puede superar los 2000 caracteres"),
  motivoMantenimiento: z
    .string()
    .max(200, "El motivo no puede superar los 200 caracteres")
    .optional()
    .or(z.literal("")),
  activoId: z.string().min(1, "Debe seleccionar un activo"),
  tipoMantenimientoId: z.string().min(1, "Debe seleccionar un tipo de mantenimiento"),
  prioridadId: z.string().min(1, "Debe seleccionar una prioridad"),
  solicitanteId: z.string().min(1, "Debe especificar el solicitante"),
  fechaSolicitud: z.string().optional().or(z.literal("")),
})

export type SolicitudFormValues = z.infer<typeof solicitudSchema>

export const defaultSolicitudValues: SolicitudFormValues = {
  titulo: "",
  descripcion: "",
  motivoMantenimiento: "",
  activoId: "",
  tipoMantenimientoId: "",
  prioridadId: "",
  solicitanteId: "",
  fechaSolicitud: "",
}
