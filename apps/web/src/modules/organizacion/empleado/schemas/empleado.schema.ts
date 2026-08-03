import { z } from "zod"

export const empleadoSchema = z.object({
  personaId: z.string().min(1, "Debe seleccionar una persona"),
  areaId: z.string().min(1, "Debe seleccionar un área"),
  cargoId: z.string().min(1, "Debe seleccionar un cargo"),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar 50 caracteres"),
  fechaInicio: z.string().optional().nullable(),
  fechaFin: z.string().optional().nullable(),
})

export type EmpleadoDto = z.infer<typeof empleadoSchema>

export const defaultEmpleadoValues: EmpleadoDto = {
  personaId: "",
  areaId: "",
  cargoId: "",
  codigo: "",
  fechaInicio: "",
  fechaFin: "",
}
