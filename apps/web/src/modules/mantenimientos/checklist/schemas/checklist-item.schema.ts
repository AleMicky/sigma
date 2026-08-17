import { z } from "zod"

export const checklistItemSchema = z.object({
  checklistMantenimientoId: z
    .string()
    .min(1, "El checklist de mantenimiento es obligatorio"),
  codigo: z
    .string()
    .min(1, "El código del ítem es obligatorio")
    .max(50, "El código no puede superar los 50 caracteres"),
  nombre: z
    .string()
    .min(1, "El nombre del ítem es obligatorio")
    .max(200, "El nombre no puede superar los 200 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  tipoDatoId: z
    .string()
    .min(1, "El tipo de dato es obligatorio"),
  orden: z
    .number()
    .int("El orden debe ser un número entero")
    .min(0, "El orden no puede ser negativo"),
  obligatorio: z.boolean(),
  opciones: z
    .string()
    .optional()
    .or(z.literal("")),
})

export type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>

export const defaultChecklistItemValues: ChecklistItemFormValues = {
  checklistMantenimientoId: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  tipoDatoId: "",
  orden: 0,
  obligatorio: true,
  opciones: "",
}
