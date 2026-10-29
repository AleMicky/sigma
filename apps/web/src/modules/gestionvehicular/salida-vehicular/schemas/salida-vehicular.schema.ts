import { z } from "zod"

export const registrarSalidaSchema = z.object({
  activoId: z
    .string()
    .trim()
    .min(1, "Debes seleccionar un vehículo asignado"),
  empleadoId: z
    .string()
    .trim()
    .min(1, "Debes seleccionar un conductor o empleado"),
  descripcionActividad: z
    .string()
    .trim()
    .min(1, "La descripción de la actividad es obligatoria")
    .max(1000, "La descripción de la actividad no puede superar los 1000 caracteres"),
  observaciones: z
    .string()
    .max(1000, "Las observaciones no pueden superar los 1000 caracteres"),
})

export type RegistrarSalidaFormValues = z.infer<typeof registrarSalidaSchema>

export const defaultRegistrarSalidaValues: RegistrarSalidaFormValues = {
  activoId: "",
  empleadoId: "",
  descripcionActividad: "",
  observaciones: "",
}
