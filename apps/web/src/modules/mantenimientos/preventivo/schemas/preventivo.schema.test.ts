import { describe, expect, it } from "vitest"
import { configuracionPreventivaSchema } from "./preventivo.schema"

describe("configuracionPreventivaSchema", () => {
  it("acepta umbrales válidos", () => {
    const res = configuracionPreventivaSchema.safeParse({
      diasAnticipacionAlerta: 15,
      kmAnticipacionAlerta: 500,
      horasAnticipacionAlerta: 50,
      evaluacionAutomaticaHabilitada: true,
      cronEvaluacion: "0 0 6 * * *",
    })
    expect(res.success).toBe(true)
  })

  it("rechaza días menores a 1", () => {
    const res = configuracionPreventivaSchema.safeParse({
      diasAnticipacionAlerta: 0,
      kmAnticipacionAlerta: 500,
      horasAnticipacionAlerta: 50,
      evaluacionAutomaticaHabilitada: true,
      cronEvaluacion: "0 0 6 * * *",
    })
    expect(res.success).toBe(false)
  })
})
