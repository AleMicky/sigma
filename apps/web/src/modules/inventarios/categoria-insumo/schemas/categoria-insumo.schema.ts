import { z } from "zod"

export const categoriaInsumoSchema = z.object({
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(30, "El código no puede superar 30 caracteres"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .nullable(),
})

export type CategoriaInsumoDto = z.infer<typeof categoriaInsumoSchema>

export const defaultCategoriaInsumoValues: CategoriaInsumoDto = {
  codigo: "",
  nombre: "",
  descripcion: "",
}
