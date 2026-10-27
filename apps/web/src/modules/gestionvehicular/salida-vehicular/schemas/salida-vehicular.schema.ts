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
  origen: z
    .string()
    .trim()
    .min(1, "El lugar de origen es obligatorio")
    .max(255, "El origen no puede superar los 255 caracteres"),
  destino: z
    .string()
    .trim()
    .min(1, "El lugar de destino es obligatorio")
    .max(255, "El destino no puede superar los 255 caracteres"),
  motivo: z
    .string()
    .trim()
    .min(1, "El motivo o justificación del viaje es obligatorio")
    .max(1000, "El motivo no puede superar los 1000 caracteres"),
})

export type RegistrarSalidaFormValues = z.infer<typeof registrarSalidaSchema>

export const defaultRegistrarSalidaValues: RegistrarSalidaFormValues = {
  activoId: "",
  empleadoId: "",
  origen: "",
  destino: "",
  motivo: "",
}
