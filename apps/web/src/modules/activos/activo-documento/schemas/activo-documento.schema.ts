import { z } from "zod"

export const activoDocumentoSchema = z.object({
  activoId: z.string().uuid("ID de activo inválido"),
  tipoDocumentoId: z.string().uuid("Seleccione un tipo de documento"),
  numeroDocumento: z
    .string()
    .max(100, "El número de documento no puede superar 100 caracteres")
    .optional()
    .or(z.literal("")),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar 150 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .or(z.literal("")),
  fechaEmision: z.string().optional().or(z.literal("")),
  fechaVencimiento: z.string().optional().or(z.literal("")),
})

export type ActivoDocumentoFormData = z.infer<typeof activoDocumentoSchema>
