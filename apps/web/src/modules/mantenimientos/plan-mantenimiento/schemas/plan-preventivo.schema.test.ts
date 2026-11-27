import { describe, expect, it } from "vitest"
import { planPreventivoWizardSchema } from "./plan-preventivo.schema"

describe("planPreventivoWizardSchema", () => {
  it("valida plan por TIEMPO con dias positivos", () => {
    const result = planPreventivoWizardSchema.safeParse({
      tipoActivoId: "11111111-1111-1111-1111-111111111111",
      codigo: "PLAN-01",
      nombre: "Plan Trimestral",
      estado: "ACTIVO",
      criterioDefaultTipo: "TIEMPO",
      criterioDefaultDias: 90,
    })
    expect(result.success).toBe(true)
  })

  it("rechaza plan por KILOMETRAJE sin intervalo de uso con mensaje en español", () => {
    const result = planPreventivoWizardSchema.safeParse({
      tipoActivoId: "11111111-1111-1111-1111-111111111111",
      codigo: "PLAN-02",
      nombre: "Plan 5000 km",
      estado: "ACTIVO",
      criterioDefaultTipo: "KILOMETRAJE",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Ingresa el intervalo de uso (km u horas)")
    }
  })

  it("rechaza plan por TIEMPO sin días con mensaje en español", () => {
    const result = planPreventivoWizardSchema.safeParse({
      tipoActivoId: "11111111-1111-1111-1111-111111111111",
      codigo: "PLAN-03",
      nombre: "Plan sin días",
      estado: "ACTIVO",
      criterioDefaultTipo: "TIEMPO",
      criterioDefaultDias: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Ingresa el intervalo en días para criterio por fecha",
      )
    }
  })

  it("localiza al español los errores de decimales, cero/negativos y valores no numéricos", () => {
    const decimalResult = planPreventivoWizardSchema.safeParse({
      tipoActivoId: "11111111-1111-1111-1111-111111111111",
      codigo: "PLAN-04",
      nombre: "Plan decimal",
      estado: "ACTIVO",
      criterioDefaultTipo: "TIEMPO",
      criterioDefaultDias: 12.5,
    })
    expect(decimalResult.success).toBe(false)
    if (!decimalResult.success) {
      expect(decimalResult.error.issues[0]?.message).toBe("Debe ser un número entero")
    }

    const zeroDiasResult = planPreventivoWizardSchema.safeParse({
      tipoActivoId: "11111111-1111-1111-1111-111111111111",
      codigo: "PLAN-05",
      nombre: "Plan cero días",
      estado: "ACTIVO",
      criterioDefaultTipo: "TIEMPO",
      criterioDefaultDias: 0,
    })
    expect(zeroDiasResult.success).toBe(false)
    if (!zeroDiasResult.success) {
      expect(zeroDiasResult.error.issues[0]?.message).toBe("Debe ser mayor a 0")
    }

    const zeroUsoResult = planPreventivoWizardSchema.safeParse({
      tipoActivoId: "11111111-1111-1111-1111-111111111111",
      codigo: "PLAN-06",
      nombre: "Plan cero uso",
      estado: "ACTIVO",
      criterioDefaultTipo: "HORAS_USO",
      criterioDefaultUso: -10,
    })
    expect(zeroUsoResult.success).toBe(false)
    if (!zeroUsoResult.success) {
      expect(zeroUsoResult.error.issues[0]?.message).toBe("Debe ser mayor a 0")
    }

    const nanResult = planPreventivoWizardSchema.safeParse({
      tipoActivoId: "11111111-1111-1111-1111-111111111111",
      codigo: "PLAN-07",
      nombre: "Plan NaN",
      estado: "ACTIVO",
      criterioDefaultTipo: "TIEMPO",
      criterioDefaultDias: "abc",
    })
    expect(nanResult.success).toBe(false)
    if (!nanResult.success) {
      expect(nanResult.error.issues[0]?.message).toBe("Debe ser un número válido")
    }
  })
})
