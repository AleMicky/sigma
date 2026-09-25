import { z } from "zod"

export const conductorSchema = z.object({
  empleadoId: z.string().min(1, "Debes seleccionar un empleado"),
  numeroLicencia: z
    .string()
    .trim()
    .min(2, "El número de licencia debe tener al menos 2 caracteres")
    .max(50, "El número de licencia no puede superar los 50 caracteres"),
  categoriaLicencia: z
    .string()
    .trim()
    .min(1, "La categoría de licencia es obligatoria")
    .max(20, "La categoría no puede superar los 20 caracteres"),
  fechaVencimiento: z.string().min(1, "La fecha de vencimiento es obligatoria"),
  activo: z.boolean(),
})

export type ConductorFormValues = z.infer<typeof conductorSchema>

export const defaultConductorValues: ConductorFormValues = {
  empleadoId: "",
  numeroLicencia: "",
  categoriaLicencia: "C",
  fechaVencimiento: "",
  activo: true,
}

export const CATEGORIAS_LICENCIA = [
  { value: "M", label: "Categoría M (Motociclista)" },
  { value: "P", label: "Categoría P (Particular)" },
  { value: "A", label: "Categoría A (Profesional A)" },
  { value: "B", label: "Categoría B (Profesional B)" },
  { value: "C", label: "Categoría C (Profesional C)" },
  { value: "T", label: "Categoría T (Tractorista / Maquinaria)" },
] as const
