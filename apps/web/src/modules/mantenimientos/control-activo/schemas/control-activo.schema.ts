import { z } from "zod"

export const controlActivoDetalleItemSchema = z.object({
  accesorioId: z.string().uuid("Seleccione un accesorio válido"),
  nombreAccesorio: z.string().optional(),
  codigoAccesorio: z.string().optional(),
  cantidadEsperada: z.number().int().min(0, "Mínimo 0"),
  cantidadEncontrada: z.number().int().min(0, "Mínimo 0"),
  conforme: z.boolean(),
  observacion: z
    .string()
    .max(300, "Máximo 300 caracteres")
    .optional()
    .nullable(),
})

export type ControlActivoDetalleItemFormValues = z.infer<
  typeof controlActivoDetalleItemSchema
>

export const controlActivoFormSchema = z.object({
  solicitudMantenimientoId: z
    .string()
    .uuid("El ID de la solicitud es obligatorio"),
  ordenTrabajoId: z.string().uuid().optional().nullable(),
  activoId: z.string().uuid("El ID del activo es obligatorio"),
  tipo: z.enum(["ENTREGA", "DEVOLUCION"] as const),
  entregadoPorId: z.string().uuid().optional().nullable(),
  recibidoPorId: z.string().uuid().optional().nullable(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  conforme: z.boolean(),
  observacion: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .nullable(),
  detalles: z.array(controlActivoDetalleItemSchema),
})

export type ControlActivoFormValues = z.infer<typeof controlActivoFormSchema>

export const defaultControlActivoValues: ControlActivoFormValues = {
  solicitudMantenimientoId: "",
  ordenTrabajoId: null,
  activoId: "",
  tipo: "ENTREGA",
  entregadoPorId: null,
  recibidoPorId: null,
  fecha: new Date().toISOString().substring(0, 16),
  conforme: true,
  observacion: "",
  detalles: [],
}
