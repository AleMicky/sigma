import { z } from "zod"

export const catalogoSchema = z.object({
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar 50 caracteres"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
})

export type CatalogoDto = z.infer<typeof catalogoSchema>

export const defaultCatalogoValues: CatalogoDto = {
  codigo: "",
  nombre: "",
}
