import { beforeEach, describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api"

import { getGestionVehicularTotales } from "./gestion-vehicular-totales.service"

vi.mock("@/shared/api", () => ({
  http: {
    get: vi.fn(async () => ({
      totalRegistros: 0,
      totalLitros: 0,
      totalImporte: 0,
      totalKm: 0,
      fechaDesde: null,
      fechaHasta: null,
    })),
  },
}))

describe("gestion-vehicular-totales.service (REQ-VEH-009)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("consulta /reportes/gestion-vehicular/totales con modulo=combustible y todos los filtros, sin page/size/sort", async () => {
    await getGestionVehicularTotales("combustible", {
      search: "  factura  ",
      activoId: "activo-1",
      viajeVehicularId: "viaje-1",
      salidaVehicularId: "salida-1",
      insumoId: "insumo-1",
      empleadoId: "empleado-1",
      fechaDesde: "2026-11-01",
      fechaHasta: "2026-11-26",
    })

    expect(http.get).toHaveBeenCalledWith(
      "/reportes/gestion-vehicular/totales",
      {
        params: {
          modulo: "combustible",
          search: "  factura  ",
          activoId: "activo-1",
          viajeVehicularId: "viaje-1",
          salidaVehicularId: "salida-1",
          insumoId: "insumo-1",
          empleadoId: "empleado-1",
          fechaDesde: "2026-11-01T00:00:00",
          fechaHasta: "2026-11-26T23:59:59",
        },
      }
    )

    const [, config] = vi.mocked(http.get).mock.calls[0]
    const params = config?.params as Record<string, unknown>
    expect(params).not.toHaveProperty("page")
    expect(params).not.toHaveProperty("size")
    expect(params).not.toHaveProperty("sort")
    expect(params).not.toHaveProperty("sortBy")
    expect(params).not.toHaveProperty("direction")
  })

  it("consulta modulo=viajes con los filtros del listado y normaliza el rango de fechas", async () => {
    await getGestionVehicularTotales("viajes", {
      search: "viaje",
      activoId: "activo-1",
      asignacionVehicularId: "asignacion-1",
      solicitudVehicularId: "solicitud-1",
      conductorId: "conductor-1",
      estado: "FINALIZADO",
      fechaDesde: "2026-11-01",
      fechaHasta: "2026-11-26T23:00:00",
    })

    expect(http.get).toHaveBeenCalledWith(
      "/reportes/gestion-vehicular/totales",
      {
        params: {
          modulo: "viajes",
          search: "viaje",
          activoId: "activo-1",
          asignacionVehicularId: "asignacion-1",
          solicitudVehicularId: "solicitud-1",
          conductorId: "conductor-1",
          estado: "FINALIZADO",
          fechaDesde: "2026-11-01T00:00:00",
          fechaHasta: "2026-11-26T23:00:00",
        },
      }
    )
  })

  it("no envía filtros vacíos ni parámetros de paginación", async () => {
    await getGestionVehicularTotales("viajes", {
      search: "",
      activoId: undefined,
      estado: undefined,
    })

    expect(http.get).toHaveBeenCalledWith(
      "/reportes/gestion-vehicular/totales",
      { params: { modulo: "viajes" } }
    )
  })
})
