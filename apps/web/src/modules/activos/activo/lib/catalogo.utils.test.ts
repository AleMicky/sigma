import { describe, expect, it } from "vitest"

import {
  ALL_TIPOS,
  ALL_UBICACIONES,
  buildActivoListFilters,
  buildActivoResumenFilters,
} from "./catalogo.utils"

describe("buildActivoListFilters", () => {
  it("omite filtros vacíos y normaliza la búsqueda", () => {
    expect(
      buildActivoListFilters({
        page: 2,
        size: 12,
        search: "  PC-001  ",
        tipoActivoId: ALL_TIPOS,
        ubicacionId: ALL_UBICACIONES,
      }),
    ).toEqual({
      page: 2,
      size: 12,
      q: "PC-001",
      sortBy: "createdAt",
      direction: "DESC",
    })
  })

  it("envía ubicacionId y tipoActivoId cuando hay selección", () => {
    expect(
      buildActivoListFilters({
        page: 0,
        size: 12,
        search: "   ",
        tipoActivoId: "tipo-1",
        ubicacionId: "ubic-1",
        sortBy: "codigo",
        direction: "ASC",
      }),
    ).toEqual({
      page: 0,
      size: 12,
      tipoActivoId: "tipo-1",
      ubicacionId: "ubic-1",
      sortBy: "codigo",
      direction: "ASC",
    })
  })
})

describe("buildActivoResumenFilters", () => {
  it("conserva solo los criterios comunes, sin paginación", () => {
    const listFilters = buildActivoListFilters({
      page: 3,
      size: 12,
      search: "impresora",
      tipoActivoId: "tipo-9",
      ubicacionId: ALL_UBICACIONES,
    })

    expect(buildActivoResumenFilters(listFilters)).toEqual({
      q: "impresora",
      tipoActivoId: "tipo-9",
    })
  })
})
