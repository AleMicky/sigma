import { z } from "zod"

export const tipoCriterioEnum = z.enum(["TIEMPO", "KILOMETRAJE", "HORAS_USO"])

export const criterioItemSchema = z
  .object({
    id: z.string().optional(),
    tipoCriterio: tipoCriterioEnum,
    intervaloDias: z.coerce.number().int().positive("Debe ser mayor a 0").optional().nullable(),
    intervaloUso: z.coerce.number().positive("Debe ser mayor a 0").optional().nullable(),
    proximaFecha: z.string().optional().nullable(),
    proximoValorUso: z.coerce.number().positive("Debe ser mayor a 0").optional().nullable(),
    activo: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.tipoCriterio === "TIEMPO") {
      if (!data.intervaloDias || data.intervaloDias <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El intervalo en días es obligatorio para el criterio de Tiempo",
          path: ["intervaloDias"],
        })
      }
    } else if (data.tipoCriterio === "KILOMETRAJE") {
      if (!data.intervaloUso || data.intervaloUso <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El intervalo de kilometraje es obligatorio",
          path: ["intervaloUso"],
        })
      }
    } else if (data.tipoCriterio === "HORAS_USO") {
      if (!data.intervaloUso || data.intervaloUso <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El intervalo de horas de uso es obligatorio",
          path: ["intervaloUso"],
        })
      }
    }
  })

export const programacionMantenimientoSchema = z
  .object({
    planMantenimientoActivoId: z.string().min(1, "La asignación del activo al plan es obligatoria"),
    activo: z.boolean().default(true),
    criterios: z.array(criterioItemSchema).min(1, "Debe agregar al menos un criterio"),
  })
  .superRefine((data, ctx) => {
    // Regla 1: Cada programación debe tener al menos un criterio activo
    const tieneActivo = data.criterios.some((c) => c.activo)
    if (!tieneActivo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cada programación debe tener al menos un criterio activo (Regla 1)",
        path: ["criterios"],
      })
    }

    // Regla 2: No permitir dos criterios del mismo tipo dentro de una misma programación
    const tipos = new Set<string>()
    data.criterios.forEach((c, idx) => {
      if (tipos.has(c.tipoCriterio)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Ya existe un criterio del tipo ${c.tipoCriterio} en esta programación (Regla 2)`,
          path: ["criterios", idx, "tipoCriterio"],
        })
      }
      tipos.add(c.tipoCriterio)
    })
  })

export type CriterioItemFormValues = z.infer<typeof criterioItemSchema>
export type ProgramacionMantenimientoFormValues = z.infer<typeof programacionMantenimientoSchema>

export const defaultCriterioValues: CriterioItemFormValues = {
  tipoCriterio: "TIEMPO",
  intervaloDias: 90,
  intervaloUso: null,
  proximaFecha: "",
  proximoValorUso: null,
  activo: true,
}

export const defaultProgramacionValues: ProgramacionMantenimientoFormValues = {
  planMantenimientoActivoId: "",
  activo: true,
  criterios: [defaultCriterioValues],
}
