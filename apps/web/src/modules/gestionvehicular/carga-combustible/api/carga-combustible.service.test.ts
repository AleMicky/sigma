import { beforeEach, describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api"

import {
  exportarCargasCombustibleExcel,
  listCargasCombustible,
} from "./carga-combustible.service"

vi.mock("@/shared/api", () => ({
  http: {
    get: vi.fn(async () => ({ content: [] })),
  },
}))

describe("carga-combustible.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:combustible"),
    })
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
  })

  it("envía page/size/sortBy/direction y normaliza el rango de fechas", async () => {
    await listCargasCombustible({
      page: 1,
      size: 25,
      sortBy: "fechaCarga",
      direction: "DESC",
      search: "  factura  ",
      activoId: "activo-1",
      viajeVehicularId: "viaje-1",
      salidaVehicularId: "salida-1",
      insumoId: "insumo-1",
      empleadoId: "empleado-1",
      fechaDesde: "2026-11-01",
      fechaHasta: "2026-11-26",
    })

    expect(http.get).toHaveBeenCalledWith("/cargas-combustible", {
      params: {
        page: 1,
        size: 25,
        sortBy: "fechaCarga",
        direction: "DESC",
        search: "  factura  ",
        activoId: "activo-1",
        viajeVehicularId: "viaje-1",
        salidaVehicularId: "salida-1",
        insumoId: "insumo-1",
        empleadoId: "empleado-1",
        fechaDesde: "2026-11-01T00:00:00",
        fechaHasta: "2026-11-26T23:59:59",
      },
    })
  })

  it("exporta con salidaVehicularId y la misma normalización de fechas", async () => {
    await exportarCargasCombustibleExcel({
      search: " factura ",
      activoId: "activo-1",
      viajeVehicularId: "viaje-1",
      salidaVehicularId: "salida-1",
      insumoId: "insumo-1",
      empleadoId: "empleado-1",
      fechaDesde: "2026-11-01",
      fechaHasta: "2026-11-26",
    })

    expect(http.get).toHaveBeenCalledWith("/cargas-combustible/exportar-excel", {
      params: {
        search: " factura ",
        activoId: "activo-1",
        viajeVehicularId: "viaje-1",
        salidaVehicularId: "salida-1",
        insumoId: "insumo-1",
        empleadoId: "empleado-1",
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
