import { z } from "zod"

export const unidadMedidaSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar 50 caracteres")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "El código solo puede contener letras, números, guiones y guiones bajos",
    ),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  simbolo: z
    .string()
    .trim()
    .min(1, "El símbolo es obligatorio")
    .max(20, "El símbolo no puede superar 20 caracteres"),
  permiteDecimal: z.boolean(),
})

export type UnidadMedidaDto = z.infer<typeof unidadMedidaSchema>

export const defaultUnidadMedidaValues: UnidadMedidaDto = {
  codigo: "",
  nombre: "",
  simbolo: "",
  permiteDecimal: false,
}
