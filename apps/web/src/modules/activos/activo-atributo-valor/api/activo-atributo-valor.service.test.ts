import { describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api"
import type { PageResponse } from "@/shared/types/api.types"

import { activoAtributoValorEndpoints } from "./activo-atributo-valor.endpoints"
import {
  listAllActivoAtributoValores,
  replaceActivoAtributos,
  type ActivoAtributoValor,
} from "./activo-atributo-valor.service"

function valor(id: string): ActivoAtributoValor {
  return {
    id,
    activoId: "activo-1",
    activoAtributoId: `atr-${id}`,
    valor: `valor-${id}`,
  } as ActivoAtributoValor
}

function page(
  content: ActivoAtributoValor[],
  totalElements: number,
  totalPages: number,
  pageNumber: number,
): PageResponse<ActivoAtributoValor> {
  return {
    content,
    page: pageNumber,
    size: 100,
    totalElements,
    totalPages,
    first: pageNumber === 0,
    last: pageNumber === totalPages - 1,
    empty: content.length === 0,
  }
}

describe("listAllActivoAtributoValores", () => {
  it("recorre todas las páginas de 100 en 100 hasta agotarlas", async () => {
    const get = vi
      .spyOn(http, "get")
      .mockResolvedValueOnce(page([valor("1"), valor("2")], 101, 2, 0))
      .mockResolvedValueOnce(page([valor("101")], 101, 2, 1))

    const valores = await listAllActivoAtributoValores({
      activoId: "activo-1",
    })

    expect(valores.map((item) => item.id)).toEqual(["1", "2", "101"])
    expect(get).toHaveBeenNthCalledWith(
      1,
      activoAtributoValorEndpoints.root,
      { params: { activoId: "activo-1", page: 0, size: 100 } },
    )
    expect(get).toHaveBeenNthCalledWith(
      2,
      activoAtributoValorEndpoints.root,
      { params: { activoId: "activo-1", page: 1, size: 100 } },
    )
    expect(get).toHaveBeenCalledTimes(2)
  })

  it("no pide una segunda página cuando la primera es la última", async () => {
    const get = vi
      .spyOn(http, "get")
      .mockResolvedValueOnce(page([valor("1")], 1, 1, 0))

    await listAllActivoAtributoValores({ activoId: "activo-1" })

    expect(get).toHaveBeenCalledTimes(1)
  })
})

describe("replaceActivoAtributos", () => {
  it("envía el conjunto completo al endpoint bulk del activo", async () => {
    const put = vi.spyOn(http, "put").mockResolvedValue(undefined)
    const payload = {
      valores: [{ atributoId: "atr-1", valor: "ABC-123" }],
    }

    await replaceActivoAtributos("activo-1", payload)

    expect(put).toHaveBeenCalledWith("/activos/activo-1/atributos", payload)
  })
})
