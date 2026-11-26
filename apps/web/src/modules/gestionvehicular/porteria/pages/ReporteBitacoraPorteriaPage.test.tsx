import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/shared/api/errors"
import type { PageResponse } from "@/shared/types/api.types"

import {
  getReporteBitacoraPorteria,
  getReporteBitacoraPorteriaPaginado,
} from "../api/porteria.service"
import type {
  BitacoraPorteriaItem,
  ReporteBitacoraPorteriaResponse,
} from "../api/porteria.types"
import { ReporteBitacoraPorteriaPage } from "./ReporteBitacoraPorteriaPage"

type FiltrosBarProps = {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  empleadoId: string
  onEmpleadoChange: (value: string) => void
  activoId: string
  onActivoChange: (value: string) => void
  fechaDesde: string
  onFechaDesdeChange: (value: string) => void
  fechaHasta: string
  onFechaHastaChange: (value: string) => void
  estado: string
  onEstadoChange: (value: string) => void
  tipoPase: string
  onTipoPaseChange: (value: string) => void
  onLimpiarFiltros: () => void
}

vi.mock("../api/porteria.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/porteria.service")>()
  return {
    ...actual,
    getReporteBitacoraPorteria: vi.fn(),
    getReporteBitacoraPorteriaPaginado: vi.fn(),
    abrirReporteBitacoraPorteriaPdf: vi.fn(),
    descargarReporteBitacoraPorteriaPdf: vi.fn(),
  }
})

vi.mock("../components/ReporteBitacoraPorteriaFiltrosBar", () => ({
  ReporteBitacoraPorteriaFiltrosBar: ({
    searchQuery,
    onSearchQueryChange,
    empleadoId,
    onEmpleadoChange,
    activoId,
    onActivoChange,
    fechaDesde,
    onFechaDesdeChange,
    fechaHasta,
    onFechaHastaChange,
    estado,
    onEstadoChange,
    tipoPase,
    onTipoPaseChange,
    onLimpiarFiltros,
  }: FiltrosBarProps) => (
    <div data-testid="filtros-bitacora">
      <input
        aria-label="Búsqueda"
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
      />
      <input
        aria-label="Funcionario"
        value={empleadoId}
        onChange={(event) => onEmpleadoChange(event.target.value)}
      />
      <input
        aria-label="Vehículo"
        value={activoId}
        onChange={(event) => onActivoChange(event.target.value)}
      />
      <input
        aria-label="Fecha desde"
        type="date"
        value={fechaDesde}
        onChange={(event) => onFechaDesdeChange(event.target.value)}
      />
      <input
        aria-label="Fecha hasta"
        type="date"
        value={fechaHasta}
        onChange={(event) => onFechaHastaChange(event.target.value)}
      />
      <select
        aria-label="Estado"
        value={estado}
        onChange={(event) => onEstadoChange(event.target.value)}
      >
        <option value="TODOS">Todos</option>
        <option value="AFUERA">Afuera</option>
      </select>
      <select
        aria-label="Tipo de pase"
        value={tipoPase}
        onChange={(event) => onTipoPaseChange(event.target.value)}
      >
        <option value="TODOS">Todos</option>
        <option value="EXTERNO">Externo</option>
      </select>
      <button type="button" onClick={onLimpiarFiltros}>
        Limpiar filtros
      </button>
    </div>
  ),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

function buildItem(index: number): BitacoraPorteriaItem {
  return {
    id: `item-${index}`,
    numero: `FOL-${index}`,
    estado: "COMPLETADO",
    fechaHoraSalida: `2026-11-26T08:${String(index % 60).padStart(2, "0")}:00`,
    activos: [],
  }
}

function buildPage(
  requestedPage: number,
  content: BitacoraPorteriaItem[],
  totalElements = 1201,
  size = 20
): PageResponse<BitacoraPorteriaItem> {
  const totalPages = Math.ceil(totalElements / size)
  return {
    content,
    page: requestedPage,
    size,
    totalElements,
    totalPages,
    first: requestedPage === 0,
    last: requestedPage === totalPages - 1,
    empty: content.length === 0,
  }
}

const agregados: ReporteBitacoraPorteriaResponse = {
  periodoTexto: "Noviembre 2026",
  mes: "11",
  anio: 2026,
  totalRegistros: 1201,
  totalInternos: 800,
  totalExternos: 401,
  totalAfuera: 17,
  totalCompletados: 1100,
  totalAnulados: 84,
  totalActivosMovilizados: 3000,
  totalActivosNoRetornados: 55,
  duracionPromedioMinutos: 42,
  items: [],
}

describe("ReporteBitacoraPorteriaPage — paginación server-side", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getReporteBitacoraPorteria).mockResolvedValue(agregados)
  })

  afterEach(() => {
    cleanup()
  })

  it("muestra solo los 20 elementos del servidor y los agregados de /reporte", async () => {
    const content = Array.from({ length: 20 }, (_, index) => buildItem(index))
    vi.mocked(getReporteBitacoraPorteriaPaginado).mockResolvedValue(
      buildPage(0, content)
    )

    const { Wrapper } = createWrapper()
    render(<ReporteBitacoraPorteriaPage />, { wrapper: Wrapper })

    expect(await screen.findByText("FOL-19")).toBeInTheDocument()
    const rows = within(document.querySelector("tbody")!).getAllByRole("row")
    expect(rows).toHaveLength(20)
    expect(screen.queryByText("FOL-20")).not.toBeInTheDocument()
    expect(screen.getByText(/Total en esta página/)).toBeInTheDocument()

    const metricas = screen.getByTestId("metricas-bitacora-porteria")
    expect(within(metricas).getByText("1201")).toBeInTheDocument()
    expect(within(metricas).getByText("800")).toBeInTheDocument()
    expect(within(metricas).getByText("401")).toBeInTheDocument()
    expect(within(metricas).getByText("3000")).toBeInTheDocument()

    expect(getReporteBitacoraPorteriaPaginado).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, size: 20, search: undefined })
    )
    const [filtrosAgregados] = vi.mocked(getReporteBitacoraPorteria).mock.calls[0]
    expect(filtrosAgregados).not.toHaveProperty("page")
    expect(filtrosAgregados).not.toHaveProperty("size")
  })

  it("cambia a page=1, envía search al servidor y reinicia page al cambiar un filtro", async () => {
    vi.mocked(getReporteBitacoraPorteriaPaginado).mockImplementation(
      async (params) =>
        buildPage(
          params?.page ?? 0,
          [buildItem((params?.page ?? 0) * 20)],
          1201,
          params?.size ?? 20
        )
    )

    const { Wrapper } = createWrapper()
    render(<ReporteBitacoraPorteriaPage />, { wrapper: Wrapper })

    expect(await screen.findByText("FOL-0")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }))

    await waitFor(() => {
      expect(getReporteBitacoraPorteriaPaginado).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, size: 20 })
      )
    })
    expect(await screen.findByText("FOL-20")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "AFUERA" },
    })
    await waitFor(() => {
      expect(getReporteBitacoraPorteriaPaginado).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0, estado: "AFUERA" })
      )
    })

    fireEvent.change(screen.getByLabelText("Búsqueda"), {
      target: { value: "FOL-99" },
    })
    await waitFor(
      () => {
        expect(getReporteBitacoraPorteriaPaginado).toHaveBeenCalledWith(
          expect.objectContaining({ page: 0, search: "FOL-99" })
        )
      },
      { timeout: 2000 }
    )

    const [filtrosAgregados] =
      vi.mocked(getReporteBitacoraPorteria).mock.calls.at(-1)!
    expect(filtrosAgregados).toEqual(
      expect.objectContaining({ estado: "AFUERA", search: "FOL-99" })
    )
  })

  it("ante 503 anuncia el error, no pinta ceros ni vacío y permite reintentar", async () => {
    const error503 = new ApiError({
      message: "El servicio no está disponible temporalmente",
      status: 503,
    })
    vi.mocked(getReporteBitacoraPorteriaPaginado).mockRejectedValue(error503)
    vi.mocked(getReporteBitacoraPorteria).mockRejectedValue(error503)

    const { Wrapper } = createWrapper()
    render(<ReporteBitacoraPorteriaPage />, { wrapper: Wrapper })

    const alerts = await screen.findAllByRole("alert")
    expect(alerts).toHaveLength(2)
    expect(alerts[0]).toHaveTextContent(
      "El servicio no está disponible temporalmente"
    )
    expect(alerts[1]).toHaveTextContent("Error al cargar los agregados")

    const metricas = screen.getByTestId("metricas-bitacora-porteria")
    expect(metricas).toHaveAttribute("aria-busy", "false")
    expect(within(metricas).getAllByText("—").length).toBeGreaterThan(0)
    expect(within(metricas).queryByText("0")).not.toBeInTheDocument()
    expect(
      screen.queryByText(/No se encontraron registros en la bitácora/)
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Reintentar bitácora/i }))
    fireEvent.click(screen.getByRole("button", { name: /Reintentar agregados/i }))

    await waitFor(() => {
      expect(getReporteBitacoraPorteriaPaginado).toHaveBeenCalledTimes(2)
      expect(getReporteBitacoraPorteria).toHaveBeenCalledTimes(2)
    })
  })
})
