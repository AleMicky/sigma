import { z } from "zod"

export const tipoDocumentoSchema = z.object({
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
  requiereVencimiento: z.boolean(),
})

export type TipoDocumentoDto = z.infer<typeof tipoDocumentoSchema>

export const defaultTipoDocumentoValues: TipoDocumentoDto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  requiereVencimiento: false,
}
