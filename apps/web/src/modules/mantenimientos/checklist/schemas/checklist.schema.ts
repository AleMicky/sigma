import { z } from "zod"

export const checklistSchema = z.object({
  actividadMantenimientoId: z
    .string()
    .min(1, "La actividad de mantenimiento es obligatoria"),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar los 50 caracteres")
    .regex(
      /^[A-Z0-9_-]+$/,
      "El código solo debe contener mayúsculas, números, guiones y guiones bajos",
    ),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar los 150 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
})

export type ChecklistFormValues = z.infer<typeof checklistSchema>

export const defaultChecklistValues: ChecklistFormValues = {
  actividadMantenimientoId: "",
  codigo: "",
  nombre: "",
  descripcion: "",
}
