import { z } from "zod"

import { TIPO_ACTIVO_ICON_OPTIONS } from "../lib/tipo-activo-icons"

export const tipoActivoSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar 100 caracteres"),
  descripcion: z
    .string()
    .max(255, "La descripción no puede superar 255 caracteres"),
  color: z
    .string()
    .refine(
      (value) => value === "" || /^#[0-9A-Fa-f]{6}$/.test(value),
      "El color debe tener el formato #RRGGBB",
    ),
  icono: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        (TIPO_ACTIVO_ICON_OPTIONS as readonly string[]).includes(value),
      "Selecciona un icono de la lista",
    ),
})

export type TipoActivoDto = z.infer<typeof tipoActivoSchema>

export const defaultTipoActivoValues: TipoActivoDto = {
  nombre: "",
  descripcion: "",
  color: "",
  icono: "",
}
