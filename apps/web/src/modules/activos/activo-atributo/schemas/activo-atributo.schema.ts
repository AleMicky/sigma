import { z } from "zod"

export const activoAtributoOpcionSchema = z.object({
  value: z
    .string()
    .min(1, "El valor es requerido")
    .max(100, "El valor no puede superar 100 caracteres"),
  label: z
    .string()
    .min(1, "La etiqueta es requerida")
    .max(100, "La etiqueta no puede superar 100 caracteres"),
})

export const activoAtributoSchema = z.object({
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar 50 caracteres"),
  etiqueta: z
    .string()
    .min(2, "La etiqueta debe tener al menos 2 caracteres")
    .max(100, "La etiqueta no puede superar 100 caracteres"),
  descripcion: z
    .string()
    .max(255, "La descripción no puede superar 255 caracteres"),
  tipoDatoId: z.string().min(1, "Selecciona un tipo de dato"),
  orden: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo")
    .optional()
    .nullable(),
  requerido: z.boolean(),
  visible: z.boolean(),
  editable: z.boolean(),
  valorDefecto: z
    .string()
    .max(255, "El valor por defecto no puede superar 255 caracteres"),
  opciones: z.array(activoAtributoOpcionSchema),
})

export type ActivoAtributoDto = z.infer<typeof activoAtributoSchema>

export const defaultActivoAtributoValues: ActivoAtributoDto = {
  codigo: "",
  etiqueta: "",
  descripcion: "",
  tipoDatoId: "",
  orden: 0,
  requerido: false,
  visible: true,
  editable: true,
  valorDefecto: "",
  opciones: [],
}
