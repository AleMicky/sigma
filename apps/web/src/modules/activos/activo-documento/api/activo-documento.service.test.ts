import { beforeEach, describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api"

import {
  getActivoDocumentosResumen,
  listActivoDocumentos,
} from "./activo-documento.service"

vi.mock("@/shared/api", () => ({
  http: {
    get: vi.fn(async () => ({ content: [] })),
  },
}))

describe("activo-documento.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("envía la búsqueda como query y el estado como enum a la API", async () => {
    await listActivoDocumentos({
      activoId: "activo-1",
      query: "  póliza  ",
      tipoDocumentoId: "tipo-1",
      estado: "vigente",
      page: 1,
      size: 12,
    })

    expect(http.get).toHaveBeenCalledWith("/activo-documentos", {
      params: {
        activoId: "activo-1",
        query: "póliza",
        tipoDocumentoId: "tipo-1",
        estado: "VIGENTE",
        page: 1,
        size: 12,
      },
    })
  })

  it("consulta el resumen con los mismos filtros y sin paginación", async () => {
    await getActivoDocumentosResumen({
      activoId: "activo-1",
      query: "acta",
      estado: "POR_VENCER",
    })

    expect(http.get).toHaveBeenCalledWith("/activo-documentos/resumen", {
      params: {
        activoId: "activo-1",
        query: "acta",
        estado: "POR_VENCER",
      },
    })
  })
})
