import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { openControlActivoReportePdf } from "../../control-activo/api/control-activo.service"
import { openOrdenTrabajoReportePdf } from "../../orden-trabajo/api/orden-trabajo.service"
import { openSolicitudReportePdf } from "../../solicitud/api/solicitud.service"
import {
  exportarSeguimientoExcel,
  getProgramaciones,
} from "./programacion-mantenimiento.service"

const { get, openPdfInNewTab } = vi.hoisted(() => ({
  get: vi.fn(),
  openPdfInNewTab: vi.fn(),
}))

vi.mock("@/shared/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api")>()
  return { ...actual, http: { ...actual.http, get } }
})

vi.mock("@/shared/api/files", () => ({ openPdfInNewTab }))

const createObjectURL = vi.fn(() => "blob:seguimiento")
const revokeObjectURL = vi.fn()
const click = vi.fn()

beforeEach(() => {
  get.mockResolvedValue({ content: [], totalElements: 0 })
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURL,
  })
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURL,
  })
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(click)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("contrato HTTP de programaciones (REQ-MANT-014/015/034)", () => {
  it("envía page/size/sortBy/direction en la query y en la clave de consulta", async () => {
    await getProgramaciones({
      q: "excavadora",
      activo: true,
      page: 1,
      size: 20,
      sortBy: "id",
      direction: "ASC",
    })

    expect(get).toHaveBeenCalledTimes(1)
    const [url] = get.mock.calls[0] as [string]
    const query = new URLSearchParams(url.split("?")[1])
    expect(url).toContain("/programaciones-mantenimiento?")
    expect(query.get("q")).toBe("excavadora")
    expect(query.get("activo")).toBe("true")
    expect(query.get("page")).toBe("1")
    expect(query.get("size")).toBe("20")
    expect(query.get("sortBy")).toBe("id")
    expect(query.get("direction")).toBe("ASC")
  })

  it("acepta pageSize como alias retrocompatible y límita size a 500 en la capa de paginación", async () => {
    await getProgramaciones({ page: 2, pageSize: 101 })

    const [url] = get.mock.calls[0] as [string]
    const query = new URLSearchParams(url.split("?")[1])
    expect(query.get("page")).toBe("2")
    expect(query.get("size")).toBe("101")
    expect(query.has("sortBy")).toBe(false)
  })

  it("omite TODOS/vacío en filtroAlerta y filtroCriterio del reporte Excel", async () => {
    get.mockResolvedValue(new Blob(["xlsx"]))

    await exportarSeguimientoExcel({
      q: "ACT-001",
      filtroAlerta: "TODOS",
      filtroCriterio: "",
    })

    const [url, config] = get.mock.calls[0] as [
      string,
      { params: Record<string, string> },
    ]
    expect(url).toBe("/programaciones-mantenimiento/reporte-excel")
    expect(config.params).toEqual({ q: "ACT-001" })
  })

  it("propaga CRITICO y KILOMETRAJE al reporte Excel", async () => {
    get.mockResolvedValue(new Blob(["xlsx"]))

    await exportarSeguimientoExcel({
      filtroAlerta: "CRITICO",
      filtroCriterio: "KILOMETRAJE",
    })

    const [, config] = get.mock.calls[0] as [
      string,
      { params: Record<string, string> },
    ]
    expect(config.params).toEqual({
      filtroAlerta: "CRITICO",
      filtroCriterio: "KILOMETRAJE",
    })
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:seguimiento")
    expect(click).toHaveBeenCalledTimes(1)
  })

  it("usa el nombre de archivo con fecha local entera (America/La_Paz)", async () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))
    get.mockResolvedValue(new Blob(["xlsx"]))
    const appendChild = vi.spyOn(document.body, "appendChild")

    await exportarSeguimientoExcel()

    const anchor = appendChild.mock.calls
      .map(([node]) => node)
      .find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
    expect(anchor?.download).toBe(
      "seguimiento-mantenimiento-preventivo-2026-11-26.xlsx",
    )
  })
})

describe("reportes PDF (REQ-MANT-016)", () => {
  it("delega los tres reportes a openPdfInNewTab sin ObjectURL propio", async () => {
    await openSolicitudReportePdf("solicitud-1")
    await openControlActivoReportePdf("control-1")
    await openOrdenTrabajoReportePdf("ot-1")

    expect(openPdfInNewTab).toHaveBeenNthCalledWith(
      1,
      "/solicitudes-mantenimiento/solicitud-1/reporte-pdf",
      "solicitud-solicitud-1.pdf",
    )
    expect(openPdfInNewTab).toHaveBeenNthCalledWith(
      2,
      "/controles-activos/control-1/reporte-pdf",
      "acta-control-activo-control-1.pdf",
    )
    expect(openPdfInNewTab).toHaveBeenNthCalledWith(
      3,
      "/ordenes-trabajo/ot-1/reporte-pdf",
      "orden-trabajo-ot-1.pdf",
    )
    expect(createObjectURL).not.toHaveBeenCalled()
  })
})
