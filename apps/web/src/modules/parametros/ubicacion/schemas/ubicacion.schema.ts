import { z } from "zod"

export const tipoUbicacionEnum = z.enum([
  "PAIS",
  "DEPARTAMENTO",
  "CIUDAD",
  "SUCURSAL",
  "EDIFICIO",
  "PLANTA",
  "AREA",
  "OFICINA",
  "ALMACEN",
  "TALLER",
  "OTRO",
])

export const ubicacionSchema = z.object({
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(30, "El código no puede superar 30 caracteres"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar 150 caracteres"),
  descripcion: z
    .string()
    .max(250, "La descripción no puede superar 250 caracteres")
    .optional()
    .nullable(),
  tipo: tipoUbicacionEnum,
  ubicacionPadreId: z.string(),
  direccion: z
    .string()
    .max(250, "La dirección no puede superar 250 caracteres")
    .optional()
    .nullable(),
  latitud: z
    .number()
    .min(-90, "La latitud debe estar entre -90 y 90")
    .max(90, "La latitud debe estar entre -90 y 90")
    .optional()
    .nullable(),
  longitud: z
    .number()
    .min(-180, "La longitud debe estar entre -180 y 180")
    .max(180, "La longitud debe estar entre -180 y 180")
    .optional()
    .nullable(),
})

export type UbicacionDto = z.infer<typeof ubicacionSchema>

export const defaultUbicacionValues: UbicacionDto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  tipo: "CIUDAD",
  ubicacionPadreId: "__none__",
  direccion: "",
  latitud: null,
  longitud: null,
}
