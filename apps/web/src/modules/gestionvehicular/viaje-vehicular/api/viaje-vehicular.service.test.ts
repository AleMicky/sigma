import { beforeEach, describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api"

import { exportarViajesExcel, listViajes } from "./viaje-vehicular.service"

vi.mock("@/shared/api", () => ({
  http: {
    get: vi.fn(async () => ({ content: [] })),
  },
}))

describe("viaje-vehicular.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:viajes"),
    })
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
  })

  it("envía page/size/sortBy/direction y todos los filtros al listado", async () => {
    await listViajes({
      page: 2,
      size: 25,
      sortBy: "createdAt",
      direction: "DESC",
      search: "  viaje  ",
      asignacionVehicularId: "asignacion-1",
      solicitudVehicularId: "solicitud-1",
      activoId: "activo-1",
      conductorId: "conductor-1",
      estado: "FINALIZADO",
      fechaDesde: "2026-11-01T00:00:00",
      fechaHasta: "2026-11-26T23:59:59",
    })

    expect(http.get).toHaveBeenCalledWith("/viajes-vehiculares", {
      params: {
        page: 2,
        size: 25,
        sortBy: "createdAt",
        direction: "DESC",
        search: "  viaje  ",
        asignacionVehicularId: "asignacion-1",
        solicitudVehicularId: "solicitud-1",
        activoId: "activo-1",
        conductorId: "conductor-1",
        estado: "FINALIZADO",
        fechaDesde: "2026-11-01T00:00:00",
        fechaHasta: "2026-11-26T23:59:59",
      },
    })
  })

  it("exporta con todos los IDs soportados y sin parámetros de paginación", async () => {
    await exportarViajesExcel({
      search: " diesel ",
      asignacionVehicularId: "asignacion-1",
      solicitudVehicularId: "solicitud-1",
      activoId: "activo-1",
      conductorId: "conductor-1",
      estado: "EN_CURSO",
      fechaDesde: "2026-11-01T00:00:00",
      fechaHasta: "2026-11-26T23:59:59",
    })

    expect(http.get).toHaveBeenCalledWith("/viajes-vehiculares/exportar-excel", {
      params: {
        search: " diesel ",
        asignacionVehicularId: "asignacion-1",
        solicitudVehicularId: "solicitud-1",
        activoId: "activo-1",
        conductorId: "conductor-1",
        estado: "EN_CURSO",
        fechaDesde: "2026-11-01T00:00:00",
        fechaHasta: "2026-11-26T23:59:59",
      },
      responseType: "blob",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  })
})
