import { z } from "zod"

export const accesorioSchema = z.object({
  tipoActivoId: z.string().min(1, "El tipo de activo es obligatorio"),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar 50 caracteres"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  descripcion: z
    .string()
    .max(255, "La descripción no puede superar 255 caracteres"),
})

export type AccesorioDto = z.infer<typeof accesorioSchema>

export const defaultAccesorioValues: AccesorioDto = {
  tipoActivoId: "",
  codigo: "",
  nombre: "",
  descripcion: "",
}
