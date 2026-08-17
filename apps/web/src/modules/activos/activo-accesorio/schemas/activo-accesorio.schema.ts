import { z } from "zod"

export const activoAccesorioSchema = z.object({
  activoId: z.uuid("ID de activo inválido"),
  accesorioId: z.uuid("Seleccione un accesorio"),
  cantidad: z
    .coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser mayor a 0"),
  numeroSerie: z
    .string()
    .max(100, "El número de serie no puede superar 100 caracteres")
    .optional()
    .or(z.literal("")),
  observacion: z
    .string()
    .max(500, "La observación no puede superar 500 caracteres")
    .optional()
    .or(z.literal("")),
})

export type ActivoAccesorioFormData = z.infer<typeof activoAccesorioSchema>
