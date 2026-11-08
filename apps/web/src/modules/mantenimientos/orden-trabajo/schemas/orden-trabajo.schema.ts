import { z } from "zod"

export const ordenTrabajoActividadSchema = z.object({
  id: z.string().min(1),
  actividadMantenimientoId: z.string().nullable().optional(),
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción de la tarea es obligatoria")
    .max(500, "La descripción no puede exceder 500 caracteres"),
  realizado: z.boolean().default(false),
  observacion: z.string().nullable().optional(),
})

export const ordenTrabajoFormSchema = z
  .object({
    solicitudMantenimientoId: z
      .string()
      .trim()
      .min(1, "Debe seleccionar una solicitud de mantenimiento asignada"),
    activoId: z.string().trim().min(1, "Debe seleccionar un activo principal"),
    responsableId: z
      .string()
      .trim()
      .min(1, "Debe especificar el responsable o técnico"),
    fechaInicio: z
      .string()
      .trim()
      .min(1, "La fecha de inicio estimada es obligatoria"),
    fechaFin: z
      .string()
      .trim()
      .min(1, "La fecha de fin estimada es obligatoria"),
    diagnostico: z.string().trim().max(1000).optional(),
    observacion: z.string().trim().max(1000).optional(),
    actividades: z
      .array(ordenTrabajoActividadSchema)
      .min(1, "Debe agregar al menos una tarea o actividad a la orden de trabajo"),
  })
  .refine(
    (data) => {
      if (!data.fechaInicio || !data.fechaFin) return true
      const dInicio = new Date(data.fechaInicio).getTime()
      const dFin = new Date(data.fechaFin).getTime()
      if (Number.isNaN(dInicio) || Number.isNaN(dFin)) return true
      return dFin >= dInicio
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio",
      path: ["fechaFin"],
    },
  )

export type OrdenTrabajoFormSchema = z.infer<typeof ordenTrabajoFormSchema>

