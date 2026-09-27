import { z } from "zod"

export const flotaFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "Máximo 150 caracteres"),
  descripcion: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .nullable(),
  activo: z.boolean(),
})

export type FlotaFormValues = z.infer<typeof flotaFormSchema>

export const defaultFlotaValues: FlotaFormValues = {
  codigo: "",
  nombre: "",
  descripcion: "",
  activo: true,
}

export const responsableFormSchema = z.object({
  empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
  principal: z.boolean(),
  activo: z.boolean(),
})

export type ResponsableFormValues = z.infer<typeof responsableFormSchema>

export const defaultResponsableValues: ResponsableFormValues = {
  empleadoId: "",
  principal: false,
  activo: true,
}
