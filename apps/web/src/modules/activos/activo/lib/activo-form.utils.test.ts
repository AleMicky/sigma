import { describe, expect, it, vi } from "vitest"

import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import type { ActivoAtributoValor } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"
import {
  createActivoAtributoValor,
  updateActivoAtributoValor,
} from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"

import {
  formatAtributoValor,
  formatLocalDateLong,
  syncAtributoValores,
  validateAtributos,
} from "./activo-form.utils"

vi.mock(
  "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service",
  () => ({
    createActivoAtributoValor: vi.fn(async () => ({})),
    updateActivoAtributoValor: vi.fn(async () => ({})),
  }),
)

function atributo(
  id: string,
  overrides: Partial<ActivoAtributo> = {},
): ActivoAtributo {
  return {
    id,
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
  return { id: `valor-${atributoId}`, activoAtributoId: atributoId, valor: value } as ActivoAtributoValor
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

describe("formatAtributoValor", () => {
  it("formatea booleanos, multiselect y opciones", () => {
    expect(
      formatAtributoValor(atributo("b"), "true", "BOOLEAN"),
    ).toBe("Sí")
    expect(
      formatAtributoValor(atributo("b"), "FALSE", "boolean"),
    ).toBe("No")
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
        atributo("s", {
          opciones: [{ value: "si", label: "Sí" }],
        }),
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

describe("syncAtributoValores", () => {
  it("no llama al API cuando no hay cambios", async () => {
    await syncAtributoValores({
      activoId: "activo-1",
      atributos: [atributo("a1")],
      valores: { a1: "Guayaquil" },
      existentes: new Map([["a1", valor("a1", "Guayaquil")]]),
    })

    expect(createActivoAtributoValor).not.toHaveBeenCalled()
    expect(updateActivoAtributoValor).not.toHaveBeenCalled()
  })

  it("actualiza valores existentes y crea solo los nuevos con valor", async () => {
    await syncAtributoValores({
      activoId: "activo-1",
      atributos: [atributo("a1"), atributo("a2"), atributo("a3")],
      valores: { a1: "Nuevo", a2: "", a3: "Creado" },
      existentes: new Map([["a1", valor("a1", "Anterior")]]),
    })

    expect(updateActivoAtributoValor).toHaveBeenCalledWith("valor-a1", {
      activoId: "activo-1",
      activoAtributoId: "a1",
      valor: "Nuevo",
    })
    expect(createActivoAtributoValor).toHaveBeenCalledOnce()
    expect(createActivoAtributoValor).toHaveBeenCalledWith({
      activoId: "activo-1",
      activoAtributoId: "a3",
      valor: "Creado",
    })
  })
})
