import { z } from "zod"

export const categoriaSchema = z.object({
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
  orden: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo")
    .optional()
    .nullable(),
})

export type CategoriaDto = z.infer<typeof categoriaSchema>

export const defaultCategoriaValues: CategoriaDto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  orden: null,
}
