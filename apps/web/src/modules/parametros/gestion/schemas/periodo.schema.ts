import { z } from "zod"

export const periodoSchema = z
  .object({
    literal: z
      .string()
      .min(2, "El literal debe tener al menos 2 caracteres")
      .max(50, "El literal no puede superar 50 caracteres"),
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

export type PeriodoDto = z.infer<typeof periodoSchema>
