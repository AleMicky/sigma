import { beforeEach, describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api"

import { getReporteBitacoraPorteriaPaginado } from "./porteria.service"

vi.mock("@/shared/api", () => ({
  http: {
    get: vi.fn(async () => ({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    })),
  },
  openPdfInNewTab: vi.fn(),
}))

describe("porteria.service — /porteria/reporte/paginado", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("consulta la URL exacta con todos los filtros, search, page y size", async () => {
    await getReporteBitacoraPorteriaPaginado({
      search: "  AB-123  ",
      empleadoId: "empleado-1",
      activoId: "activo-1",
      areaId: "area-1",
      createdById: "usuario-1",
      esExterno: true,
      estado: "AFUERA",
      fechaDesde: "2026-11-01",
      fechaHasta: "2026-11-26",
      page: 3,
      size: 20,
    })

    expect(http.get).toHaveBeenCalledWith("/porteria/reporte/paginado", {
      params: {
        search: "  AB-123  ",
        empleadoId: "empleado-1",
        activoId: "activo-1",
        areaId: "area-1",
        createdById: "usuario-1",
        esExterno: true,
        estado: "AFUERA",
        fechaDesde: "2026-11-01",
        fechaHasta: "2026-11-26",
        page: 3,
        size: 20,
      },
    })

    const [, config] = vi.mocked(http.get).mock.calls[0]
    const params = config?.params as Record<string, unknown>
    expect(params).not.toHaveProperty("sort")
    expect(params).not.toHaveProperty("sortBy")
    expect(params).not.toHaveProperty("direction")
  })

  it("acepta los alias q / fechaInicio / fechaFin del contrato sin filtros vacíos", async () => {
    await getReporteBitacoraPorteriaPaginado({
      q: "visitante",
      fechaInicio: "2026-11-01",
      fechaFin: "2026-11-26",
      esExterno: false,
      page: 0,
      size: 10,
    })

    expect(http.get).toHaveBeenCalledWith("/porteria/reporte/paginado", {
      params: {
        q: "visitante",
        fechaInicio: "2026-11-01",
        fechaFin: "2026-11-26",
        esExterno: false,
        page: 0,
        size: 10,
      },
    })
  })
})
