import { describe, expect, it } from "vitest"

import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import type { ActivoAtributoValor } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"
import { ApiError } from "@/shared/api"

import {
  buildReplaceAtributosPayload,
  formatAtributoValor,
  formatLocalDateLong,
  mapAtributoValidationErrors,
  validateAtributos,
} from "./activo-form.utils"

function atributo(
  id: string,
  overrides: Partial<ActivoAtributo> = {},
): ActivoAtributo {
  return {
    id,
    codigo: id.toUpperCase(),
    etiqueta: `Atributo ${id}`,
    requerido: false,
    opciones: null,
    ...overrides,
  } as ActivoAtributo
}

function valor(
  atributoId: string,
  value: string | null,
): ActivoAtributoValor {
  return {
    id: `valor-${atributoId}`,
    activoAtributoId: atributoId,
    valor: value,
  } as ActivoAtributoValor
}

describe("validateAtributos", () => {
  it("marca solo atributos requeridos vacíos o con centinela '[]'", () => {
    const errors = validateAtributos(
      [
        atributo("a1", { requerido: true }),
        atributo("a2", { requerido: true }),
        atributo("a3", { requerido: true }),
        atributo("a4"),
      ],
      { a1: "   ", a2: "[]", a3: "OK" },
    )

    expect(Object.keys(errors)).toEqual(["a1", "a2"])
    expect(errors.a1).toContain("Atributo a1")
    expect(errors.a2).toContain("obligatorio")
  })
})

describe("buildReplaceAtributosPayload", () => {
  it("envía un ítem por atributo, con null para los vacíos", () => {
    const payload = buildReplaceAtributosPayload(
      [atributo("a1"), atributo("a2")],
      { a1: "  Guayaquil  ", a2: "   " },
    )

    expect(payload).toEqual({
      valores: [
        { atributoId: "a1", valor: "Guayaquil" },
        { atributoId: "a2", valor: null },
      ],
    })
  })

  it("conserva valores de atributos no visibles al reemplazar el conjunto", () => {
    const payload = buildReplaceAtributosPayload(
      [atributo("visible")],
      { visible: "Nuevo" },
      new Map([
        ["visible", valor("visible", "Viejo")],
        ["oculto", valor("oculto", "Conservado")],
      ]),
    )

    expect(payload.valores).toEqual([
      { atributoId: "visible", valor: "Nuevo" },
      { atributoId: "oculto", valor: "Conservado" },
    ])
  })
})

describe("mapAtributoValidationErrors", () => {
  it("traduce errores 422 de la API a errores por atributo", () => {
    const error = new ApiError({
      message: "Atributos requeridos incompletos",
      status: 422,
      validationErrors: [
        {
          field: "valores[0].valor",
          messages: ["El atributo es obligatorio"],
          rejectedValue: "a1",
        },
        { field: "a2", messages: ["Valor inválido"] },
        { field: "nombre", messages: ["No debería mapearse"] },
      ],
    })

    expect(
      mapAtributoValidationErrors(error, [atributo("a1"), atributo("a2")]),
    ).toEqual({
      a1: "El atributo es obligatorio",
      a2: "Valor inválido",
    })
  })

  it("mapea los 422 de la API por código de atributo", () => {
    const atributos = [atributo("a1"), atributo("a2")]

    expect(
      mapAtributoValidationErrors(
        new ApiError({
          message: "El valor es obligatorio para el atributo 'A1'",
          status: 422,
          code: "ACTIVO_ATRIBUTO_VALOR_REQUIRED",
        }),
        atributos,
      ),
    ).toEqual({ a1: "El valor es obligatorio para el atributo 'A1'" })

    expect(
      mapAtributoValidationErrors(
        new ApiError({
          message: "Faltan los atributos requeridos: A1, A2",
          status: 422,
          code: "ATRIBUTOS_REQUERIDOS_FALTANTES",
        }),
        atributos,
      ),
    ).toEqual({
      a1: "Este atributo es obligatorio",
      a2: "Este atributo es obligatorio",
    })
  })

  it("ignora errores que no sean 422", () => {
    const error = new ApiError({ message: "Fallo", status: 500 })

    expect(mapAtributoValidationErrors(error, [atributo("a1")])).toEqual({})
  })
})

describe("formatAtributoValor", () => {
  it("formatea booleanos, multiselect y opciones", () => {
    expect(formatAtributoValor(atributo("b"), "true", "BOOLEAN")).toBe("Sí")
    expect(formatAtributoValor(atributo("b"), "FALSE", "boolean")).toBe("No")
    expect(
      formatAtributoValor(
        atributo("m", {
          opciones: [
            { value: "rojo", label: "Rojo" },
            { value: "azul", label: "Azul" },
          ],
        }),
        '["rojo","verde"]',
        "MULTISELECT",
      ),
    ).toBe("Rojo, verde")
    expect(
      formatAtributoValor(
        atributo("s", { opciones: [{ value: "si", label: "Sí" }] }),
        "SI",
      ),
    ).toBe("Sí")
  })

  it("formatea fechas y devuelve null para valores vacíos", () => {
    expect(formatAtributoValor(atributo("f"), "2026-11-26", "DATE")).toBe(
      "26/11/2026",
    )
    expect(formatAtributoValor(atributo("f"), "   ")).toBeNull()
    expect(formatAtributoValor(atributo("f"), undefined)).toBeNull()
  })

  it("mantiene el texto original si el JSON no es un array", () => {
    expect(formatAtributoValor(atributo("x"), '{"a":1}', "MULTISELECT")).toBe(
      '{"a":1}',
    )
  })
})

describe("formatLocalDateLong", () => {
  it("convierte fechas ISO sin desplazar el día", () => {
    const formatted = formatLocalDateLong("2026-11-26")

    expect(formatted).toContain("2026")
    expect(formatted).toContain("noviembre")
    expect(formatLocalDateLong(null)).toBeNull()
    expect(formatLocalDateLong("no-fecha")).toBe("no-fecha")
  })
})
