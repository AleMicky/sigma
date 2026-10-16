import { z } from "zod"

export const estadoOperativoSchema = z.object({
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
    .max(255, "La descripción no puede superar 255 caracteres")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^$|^#(?:[0-9A-Fa-f]{6})$/, "El color debe tener formato #RRGGBB")
    .max(7, "El color no puede superar 7 caracteres")
    .optional()
    .nullable(),
})

export type EstadoOperativoDto = z.infer<typeof estadoOperativoSchema>

export const defaultEstadoOperativoValues: EstadoOperativoDto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  color: "#10B981",
}
