import { z } from "zod"

export const catalogoItemSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  valor: z
    .string()
    .min(1, "El valor es requerido")
    .max(50, "El valor no puede superar 50 caracteres"),
  orden: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo")
    .optional()
    .nullable(),
})

export type CatalogoItemDto = z.infer<typeof catalogoItemSchema>

export const defaultCatalogoItemValues: CatalogoItemDto = {
  nombre: "",
  valor: "",
  orden: 0,
}
