import { z } from "zod"

export const checklistItemSchema = z.object({
  actividadMantenimientoAplicacionId: z.string().min(1, "La aplicación es obligatoria"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(200, "Máximo 200 caracteres"),
  descripcion: z.string().max(500, "Máximo 500 caracteres").optional().nullable(),
  orden: z.number().int().min(0, "El orden debe ser mayor o igual a 0"),
  obligatorio: z.boolean(),
})

export type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>
