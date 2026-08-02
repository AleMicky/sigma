import { z } from "zod"

export const gestionSchema = z
  .object({
    gestion: z
      .number()
      .int("La gestión debe ser un número entero")
      .min(2000, "La gestión debe ser mayor o igual a 2000")
      .max(2100, "La gestión debe ser menor o igual a 2100"),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFin: z.string().min(1, "La fecha de fin es obligatoria"),
  })
  .refine(
    (value) => value.fechaInicio <= value.fechaFin,
    {
      message: "La fecha de inicio no puede ser posterior a la fecha de fin",
      path: ["fechaFin"],
    },
  )

export type GestionDto = z.infer<typeof gestionSchema>

export function datesForGestionYear(year: number) {
  return {
    fechaInicio: `${year}-01-01`,
    fechaFin: `${year}-12-31`,
  }
}

const currentYear = new Date().getFullYear()

export const defaultGestionValues: GestionDto = {
  gestion: currentYear,
  ...datesForGestionYear(currentYear),
}
