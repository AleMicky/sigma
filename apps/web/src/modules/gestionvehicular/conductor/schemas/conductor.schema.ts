import { z } from "zod"

export const ESTADOS_CONDUCTOR = [
  { value: "ACTIVO", label: "Activo / Habilitado" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "SUSPENDIDO", label: "Suspendido" },
  { value: "BAJA", label: "Dado de Baja" },
] as const

export const ESTADOS_LICENCIA = [
  { value: "VIGENTE", label: "Vigente" },
  { value: "VENCIDA", label: "Vencida" },
  { value: "SUSPENDIDA", label: "Suspendida" },
  { value: "CANCELADA", label: "Cancelada" },
] as const

export const CATEGORIAS_LICENCIA = [
  { value: "M", label: "Categoría M (Motociclista)" },
  { value: "P", label: "Categoría P (Particular)" },
  { value: "A", label: "Categoría A (Profesional A)" },
  { value: "B", label: "Categoría B (Profesional B)" },
  { value: "C", label: "Categoría C (Profesional C)" },
  { value: "T", label: "Categoría T (Tractorista / Maquinaria)" },
] as const

export const conductorLicenciaSchema = z.object({
  id: z.string().optional(),
  categoriaLicencia: z
    .string()
    .trim()
    .min(1, "La categoría es obligatoria")
    .max(20, "La categoría no puede superar los 20 caracteres"),
  numeroLicencia: z
    .string()
    .trim()
    .min(2, "El número de licencia debe tener al menos 2 caracteres")
    .max(100, "El número de licencia no puede superar los 100 caracteres"),
  fechaEmision: z.string().min(1, "La fecha de emisión es obligatoria"),
  fechaVencimiento: z.string().min(1, "La fecha de vencimiento es obligatoria"),
  estado: z.enum(["VIGENTE", "VENCIDA", "SUSPENDIDA", "CANCELADA"]),
  observacion: z.string().max(1000, "La observación no puede superar los 1000 caracteres").optional().nullable(),
  nombreArchivo: z.string().optional().nullable(),
  nombreOriginal: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  mimeType: z.string().optional().nullable(),
  size: z.number().optional().nullable(),
  activo: z.boolean(),
})

export type ConductorLicenciaFormValues = z.infer<typeof conductorLicenciaSchema>

export const conductorSchema = z.object({
  empleadoId: z.string().min(1, "Debes seleccionar un empleado titular"),
  estado: z.enum(["ACTIVO", "INACTIVO", "SUSPENDIDO", "BAJA"]),
  observacion: z.string().max(1000, "La observación no puede superar los 1000 caracteres").optional().nullable(),
  activo: z.boolean(),
  licencias: z
    .array(conductorLicenciaSchema)
    .min(1, "Debes registrar al menos una licencia de conducir"),
})

export type ConductorFormValues = z.infer<typeof conductorSchema>

export const defaultLicenciaValue: ConductorLicenciaFormValues = {
  categoriaLicencia: "C",
  numeroLicencia: "",
  fechaEmision: new Date().toISOString().split("T")[0],
  fechaVencimiento: "",
  estado: "VIGENTE",
  observacion: "",
  activo: true,
}

export const defaultConductorValues: ConductorFormValues = {
  empleadoId: "",
  estado: "ACTIVO",
  observacion: "",
  activo: true,
  licencias: [defaultLicenciaValue],
}
