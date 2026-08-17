import { z } from "zod"

export const actividadAplicacionSchema = z.object({
  actividadMantenimientoId: z
    .string()
    .min(1, "La actividad de mantenimiento es obligatoria"),
  tipoActivoId: z
    .string()
    .min(1, "El tipo de activo es obligatorio"),
  componenteId: z
    .string()
    .optional()
    .or(z.literal("")),
})

export type ActividadAplicacionFormValues = z.infer<
  typeof actividadAplicacionSchema
>

export const defaultActividadAplicacionValues: ActividadAplicacionFormValues = {
  actividadMantenimientoId: "",
  tipoActivoId: "",
  componenteId: "",
}
