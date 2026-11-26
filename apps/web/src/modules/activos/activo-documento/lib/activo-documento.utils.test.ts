import { describe, expect, it } from "vitest"

import {
  ALL_DOCUMENTO_FILTER,
  buildDocumentoFilters,
  getDocumentoEstado,
  normalizeDocumentoFilters,
  toApiDocumentoEstado,
} from "./activo-documento.utils"

const NOW = new Date(2026, 10, 26, 15, 30)

describe("getDocumentoEstado", () => {
  it("clasifica vigencia por fecha sin depender de la hora actual", () => {
    expect(getDocumentoEstado(null, NOW)).toBe("permanente")
    expect(getDocumentoEstado("2026-11-26", NOW)).toBe("por_vencer")
    expect(getDocumentoEstado("2026-12-26", NOW)).toBe("por_vencer")
    expect(getDocumentoEstado("2026-12-27", NOW)).toBe("vigente")
    expect(getDocumentoEstado("2026-11-25", NOW)).toBe("vencido")
  })
})

describe("toApiDocumentoEstado", () => {
  it("acepta el valor local y el enum de la API", () => {
    expect(toApiDocumentoEstado("por_vencer")).toBe("POR_VENCER")
    expect(toApiDocumentoEstado("VENCIDO")).toBe("VENCIDO")
    expect(toApiDocumentoEstado(ALL_DOCUMENTO_FILTER)).toBeUndefined()
    expect(toApiDocumentoEstado("desconocido")).toBeUndefined()
  })
})

describe("buildDocumentoFilters", () => {
  it("traduce búsqueda y filtros a los parámetros del contrato", () => {
    expect(
      buildDocumentoFilters({
        activoId: "activo-1",
        search: "  póliza  ",
        tipoDocumentoId: "tipo-2",
        estado: "vigente",
      }),
    ).toEqual({
      activoId: "activo-1",
      query: "póliza",
      tipoDocumentoId: "tipo-2",
      estado: "VIGENTE",
    })
  })

  it("omite los valores centinela de 'todos'", () => {
    expect(
      buildDocumentoFilters({
        search: "   ",
        tipoDocumentoId: ALL_DOCUMENTO_FILTER,
        estado: ALL_DOCUMENTO_FILTER,
      }),
    ).toEqual({})
  })
})

describe("normalizeDocumentoFilters", () => {
  it("recorta query y normaliza el estado sin perder paginación", () => {
    expect(
      normalizeDocumentoFilters({
        activoId: "activo-1",
        query: "  acta  ",
        estado: "permanente",
        page: 2,
        size: 12,
      }),
    ).toEqual({
      activoId: "activo-1",
      query: "acta",
      estado: "PERMANENTE",
      page: 2,
      size: 12,
    })
  })

  it("retorna undefined cuando no hay filtros", () => {
    expect(normalizeDocumentoFilters()).toBeUndefined()
  })
})
