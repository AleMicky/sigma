import { z } from "zod"

export const configuracionPreventivaSchema = z.object({
  diasAnticipacionAlerta: z.coerce
    .number()
    .int()
    .min(1, "Debe ser al menos 1 día"),
  kmAnticipacionAlerta: z.coerce
    .number()
    .min(1, "Debe ser al menos 1 km"),
  horasAnticipacionAlerta: z.coerce
    .number()
    .min(1, "Debe ser al menos 1 hora"),
  evaluacionAutomaticaHabilitada: z.boolean(),
  cronEvaluacion: z
    .string()
    .trim()
    .min(5, "La expresión cron es obligatoria"),
})

export type ConfiguracionPreventivaFormValues = z.infer<typeof configuracionPreventivaSchema>
