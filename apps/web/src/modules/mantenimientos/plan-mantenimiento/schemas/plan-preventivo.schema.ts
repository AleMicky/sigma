import { z } from "zod"

export const planPreventivoWizardSchema = z
  .object({
    tipoActivoId: z.string().min(1, "El tipo de activo es obligatorio"),
    tipoMantenimientoId: z.string().optional(),
    codigo: z
      .string()
      .trim()
      .min(1, "El código es obligatorio")
      .max(30, "El código no puede superar 30 caracteres"),
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(200, "El nombre no puede superar 200 caracteres"),
    descripcion: z.string().trim().optional(),
    estado: z.enum(["BORRADOR", "ACTIVO", "INACTIVO"], {
      error: "Selecciona un estado válido",
    }),
    criterioDefaultTipo: z.enum(["TIEMPO", "KILOMETRAJE", "HORAS_USO"], {
      error: "Selecciona un criterio válido",
    }),
    criterioDefaultDias: z.coerce
      .number({ error: "Debe ser un número válido" })
      .int("Debe ser un número entero")
      .positive("Debe ser mayor a 0")
      .optional(),
    criterioDefaultUso: z.coerce
      .number({ error: "Debe ser un número válido" })
      .positive("Debe ser mayor a 0")
      .optional(),
  })
  .superRefine((val, ctx) => {
    if (val.criterioDefaultTipo === "TIEMPO" && (!val.criterioDefaultDias || val.criterioDefaultDias <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["criterioDefaultDias"],
        message: "Ingresa el intervalo en días para criterio por fecha",
      })
    }
    if (
      (val.criterioDefaultTipo === "KILOMETRAJE" || val.criterioDefaultTipo === "HORAS_USO") &&
      (!val.criterioDefaultUso || val.criterioDefaultUso <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["criterioDefaultUso"],
        message: "Ingresa el intervalo de uso (km u horas)",
      })
    }
  })

export type PlanPreventivoWizardValues = z.infer<typeof planPreventivoWizardSchema>
