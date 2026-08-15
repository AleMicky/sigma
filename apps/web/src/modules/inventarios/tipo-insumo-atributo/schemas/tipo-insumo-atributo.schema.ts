import { z } from "zod"

export const tipoInsumoAtributoSchema = z.object({
  tipoDatoId: z.string().min(1, "El tipo de dato es obligatorio"),
  tipoInsumoId: z.string().min(1, "El tipo de insumo es obligatorio"),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar 50 caracteres"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  requerido: z.boolean(),
  orden: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo"),
})

export type TipoInsumoAtributoDto = z.infer<typeof tipoInsumoAtributoSchema>

export const defaultTipoInsumoAtributoValues: TipoInsumoAtributoDto = {
  tipoDatoId: "",
  tipoInsumoId: "",
  codigo: "",
  nombre: "",
  requerido: false,
  orden: 0,
}
