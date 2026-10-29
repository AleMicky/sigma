import { z } from "zod"

export function getLocalCurrentIsoString(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 16)
}

export const registrarSalidaSchema = z.object({
  activoId: z
    .string()
    .trim()
    .min(1, "Debes seleccionar un vehículo asignado"),
  empleadoId: z
    .string()
    .trim()
    .min(1, "Debes seleccionar un conductor o empleado"),
  fecha: z
    .string()
    .trim()
    .min(1, "La fecha y hora de salida es obligatoria"),
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
  fecha: getLocalCurrentIsoString(),
  descripcionActividad: "",
  observaciones: "",
}
