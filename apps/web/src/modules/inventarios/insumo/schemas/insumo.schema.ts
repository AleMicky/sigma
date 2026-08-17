import { z } from "zod"

export const insumoSchema = z.object({
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(30, "El código no puede superar 30 caracteres"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar 150 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .nullable(),
  categoriaInsumoId: z.string().min(1, "La categoría de insumo es obligatoria"),
  unidadMedidaId: z.string().min(1, "La unidad de medida es obligatoria"),
  marca: z
    .string()
    .max(100, "La marca no puede superar 100 caracteres")
    .optional()
    .nullable(),
})

export type InsumoDto = z.infer<typeof insumoSchema>

export const defaultInsumoValues: InsumoDto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoriaInsumoId: "",
  unidadMedidaId: "",
  marca: "",
}
