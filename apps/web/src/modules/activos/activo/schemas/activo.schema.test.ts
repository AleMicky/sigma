import { describe, expect, it } from "vitest"

import { activoSchema, defaultActivoValues } from "./activo.schema"

describe("activoSchema", () => {
  it("valida después de recortar espacios, no antes", () => {
    const resultado = activoSchema.safeParse({
      ...defaultActivoValues,
      codigo: " a ",
      nombre: "  b  ",
      tipoActivoId: "tipo-1",
    })

    expect(resultado.success).toBe(false)
    if (resultado.success) return
    expect(resultado.error.issues.map((issue) => issue.path[0])).toEqual([
      "codigo",
      "nombre",
    ])
  })

  it("acepta valores válidos y los devuelve normalizados", () => {
    const resultado = activoSchema.parse({
      ...defaultActivoValues,
      codigo: "  ACT-1  ",
      nombre: "  Transformador  ",
      descripcion: "  Principal  ",
      codigoAlternativo: "  ALT-1  ",
      tipoActivoId: "tipo-1",
    })

    expect(resultado).toMatchObject({
      codigo: "ACT-1",
      nombre: "Transformador",
      descripcion: "Principal",
      codigoAlternativo: "ALT-1",
    })
  })
})
