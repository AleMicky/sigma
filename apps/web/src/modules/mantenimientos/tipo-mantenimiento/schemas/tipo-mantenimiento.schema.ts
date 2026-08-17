import { z } from "zod"

export const tipoMantenimientoSchema = z.object({
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
    .max(100, "El nombre no puede superar los 100 caracteres"),
  descripcion: z
    .string()
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional()
    .or(z.literal("")),
})

export type TipoMantenimientoFormValues = z.infer<typeof tipoMantenimientoSchema>

export const defaultTipoMantenimientoValues: TipoMantenimientoFormValues = {
  codigo: "",
  nombre: "",
  descripcion: "",
}
