import { z } from "zod"

export const actividadSchema = z.object({
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
  aplicaTodosTiposActivo: z.boolean(),
  requiereChecklist: z.boolean(),
})

export type ActividadFormValues = z.infer<typeof actividadSchema>

export const defaultActividadValues: ActividadFormValues = {
  codigo: "",
  nombre: "",
  descripcion: "",
  aplicaTodosTiposActivo: false,
  requiereChecklist: false,
}
