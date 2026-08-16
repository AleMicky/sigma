import { z } from "zod"

export const activoSchema = z.object({
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar 50 caracteres"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  descripcion: z
    .string()
    .max(255, "La descripción no puede superar 255 caracteres"),
  tipoActivoId: z.string().min(1, "Selecciona un tipo de activo"),
  ubicacionId: z
    .string()
    .max(255, "La ubicación no puede superar 255 caracteres")
    .optional()
    .nullable(),
  fechaAdquisicion: z.string(),
})

export type ActivoDto = z.infer<typeof activoSchema>

export const defaultActivoValues: ActivoDto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  tipoActivoId: "",
  ubicacionId: "",
  fechaAdquisicion: "",
}
