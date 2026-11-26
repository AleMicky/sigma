import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  listCargasCombustible,
  type CargaCombustible,
  type CargaCombustibleListFilters,
} from "../../carga-combustible/api/carga-combustible.service"
import type { PageResponse } from "@/shared/types/api.types"

import { getReporteGeneral } from "../api/salida-vehicular.service"
import type { SalidaVehicular } from "../api/salida-vehicular.types"
import { ReportesSalidasVehicularesPage } from "./ReportesSalidasVehicularesPage"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock("../api/salida-vehicular.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/salida-vehicular.service")>()
  return {
    ...actual,
    getReporteGeneral: vi.fn(),
    descargarReporteSalidasBitacoraPdf: vi.fn(),
    abrirReporteSalidasBitacoraPdf: vi.fn(),
  }
})

vi.mock("../../carga-combustible/api/carga-combustible.service", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../carga-combustible/api/carga-combustible.service")
    >()
  return {
    ...actual,
    listCargasCombustible: vi.fn(),
  }
})

vi.mock("../components/ReporteSalidasFiltrosBar", () => ({
  ReporteSalidasFiltrosBar: () => <div data-testid="filtros-salidas" />,
}))

vi.mock("../components/ReporteBitacoraVehicularTable", () => ({
  ReporteBitacoraVehicularTable: ({ filas }: { filas: unknown[] }) => (
    <div data-testid="tabla-reporte" data-filas={filas.length} />
  ),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return { Wrapper }
}

const TOTAL_CARGAS = 10500
const PAGE_SIZE = 500
const TOTAL_PAGES = Math.ceil(TOTAL_CARGAS / PAGE_SIZE)

function buildCarga(page: number, index: number): CargaCombustible {
  return {
    id: `carga-${page}-${index}`,
    activoId: "activo-1",
    insumoId: "insumo-1",
    empleadoId: "empleado-1",
    fechaCarga: "2026-11-10T10:00:00",
    litros: 1,
    precioTotal: 1,
    salidaVehicularId: "salida-1",
  } as CargaCombustible
}

describe("ReportesSalidasVehicularesPage — paginación de cargas", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getReporteGeneral).mockResolvedValue({
      totalSalidas: 1,
      salidasActivas: 0,
      salidasFinalizadas: 1,
      salidasCanceladas: 0,
      items: [
        {
          id: "salida-1",
          numero: "SAL-001",
          fecha: "2026-11-10T08:00:00",
          estado: "FINALIZADA",
          activoId: "activo-1",
          empleadoId: "empleado-1",
          descripcionActividad: "Comisión de servicio",
          createdAt: "2026-11-10T08:00:00",
          eventos: [],
        } satisfies SalidaVehicular,
      ],
    })
    vi.mocked(listCargasCombustible).mockImplementation(
      async (filters?: CargaCombustibleListFilters) => {
        const page = filters?.page ?? 0
        const content = Array.from({ length: PAGE_SIZE }, (_, index) =>
          buildCarga(page, index)
        )
        return {
          content,
          page,
          size: PAGE_SIZE,
          totalElements: TOTAL_CARGAS,
          totalPages: TOTAL_PAGES,
          first: page === 0,
          last: page === TOTAL_PAGES - 1,
          empty: false,
        } as PageResponse<CargaCombustible>
      }
    )
  })

  afterEach(() => {
    cleanup()
  })

  it("recorre hasta 20 páginas y avisa del truncamiento con 10500 cargas", async () => {
    const { Wrapper } = createWrapper()
    render(<ReportesSalidasVehicularesPage />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(listCargasCombustible).toHaveBeenCalledTimes(20)
    })
    const aviso = await screen.findByText(
      /Reporte truncado: se mostraron 10000 de 10500 cargas/i
    )
    expect(aviso.closest('[role="status"]')).not.toBeNull()

    expect(
      vi.mocked(listCargasCombustible).mock.calls.map(([filtros]) => filtros?.page)
    ).toEqual(Array.from({ length: 20 }, (_, page) => page))
    expect(
      vi.mocked(listCargasCombustible).mock.calls.every(
        ([filtros]) => filtros?.size === PAGE_SIZE
      )
    ).toBe(true)
  })
})
