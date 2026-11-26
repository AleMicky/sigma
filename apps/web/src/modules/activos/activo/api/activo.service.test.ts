import { afterEach, describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api"

import { activoEndpoints } from "./activo.endpoints"
import { activoQueries } from "./activo.queries"
import {
  EMPTY_ACTIVO_RESUMEN,
  type ActivoResumen,
  getActivoResumen,
} from "./activo.service"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getActivoResumen", () => {
  it("consulta el endpoint de resumen del recurso activos", async () => {
    const get = vi.spyOn(http, "get").mockResolvedValue(EMPTY_ACTIVO_RESUMEN)

    await getActivoResumen({ q: "transformador" })

    expect(get).toHaveBeenCalledWith(`${activoEndpoints.root}/resumen`, {
      params: { q: "transformador" },
    })
  })
})

describe("activoQueries.resumen", () => {
  it("normaliza q y reenvía todos los filtros vigentes", async () => {
    const get = vi.spyOn(http, "get").mockResolvedValue(EMPTY_ACTIVO_RESUMEN)
    const options = activoQueries.resumen({
      q: "  ACT-1  ",
      tipoActivoId: "tipo-1",
      categoriaId: "cat-1",
      ubicacionId: "ubic-1",
      activo: true,
      estadoOperativoId: "est-1",
    })

    await (options.queryFn as () => Promise<ActivoResumen>)()

    expect(get).toHaveBeenCalledWith(`${activoEndpoints.root}/resumen`, {
      params: {
        q: "ACT-1",
        tipoActivoId: "tipo-1",
        categoriaId: "cat-1",
        ubicacionId: "ubic-1",
        activo: true,
        estadoOperativoId: "est-1",
      },
    })
  })

  it("convierte una búsqueda solo con espacios en undefined", async () => {
    const get = vi.spyOn(http, "get").mockResolvedValue(EMPTY_ACTIVO_RESUMEN)
    const options = activoQueries.resumen({ q: "   " })

    await (options.queryFn as () => Promise<ActivoResumen>)()

    expect(get).toHaveBeenCalledWith(`${activoEndpoints.root}/resumen`, {
      params: { q: undefined },
    })
  })
})
