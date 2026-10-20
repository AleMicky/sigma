import { z } from "zod"

export const planMantenimientoSchema = z.object({
  tipoActivoId: z.string().min(1, "El tipo de activo es obligatorio"),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(30, "El código no puede superar los 30 caracteres")
    .regex(
      /^[A-Z0-9_-]+$/,
      "El código solo debe contener mayúsculas, números, guiones y guiones bajos",
    ),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede superar los 200 caracteres"),
  descripcion: z
    .string()
    .max(2000, "La descripción no puede superar los 2000 caracteres")
    .optional()
    .or(z.literal("")),
})

export type PlanMantenimientoFormValues = z.infer<typeof planMantenimientoSchema>

export const defaultPlanMantenimientoValues: PlanMantenimientoFormValues = {
  tipoActivoId: "",
  codigo: "",
  nombre: "",
  descripcion: "",
}
