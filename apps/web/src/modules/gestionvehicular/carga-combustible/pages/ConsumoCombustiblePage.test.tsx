import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/shared/api/errors"
import type { PageResponse } from "@/shared/types/api.types"

import {
  listCargasCombustible,
  type CargaCombustible,
  type CargaCombustibleListFilters,
} from "../api/carga-combustible.service"
import {
  getGestionVehicularTotales,
  type GestionVehicularTotalesFiltros,
} from "../../totales/api/gestion-vehicular-totales.service"
import { ConsumoCombustiblePage } from "./ConsumoCombustiblePage"

vi.mock("../api/carga-combustible.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/carga-combustible.service")>()
  return {
    ...actual,
    listCargasCombustible: vi.fn(),
    exportarCargasCombustibleExcel: vi.fn(),
  }
})

vi.mock("../../totales/api/gestion-vehicular-totales.service", () => ({
  getGestionVehicularTotales: vi.fn(),
}))

vi.mock("../components/ConsumoCombustibleFiltrosBar", () => ({
  ConsumoCombustibleFiltrosBar: () => <div data-testid="filtros-combustible" />,
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

function buildPage(
  totalElements: number,
  content: CargaCombustible[]
): PageResponse<CargaCombustible> {
  return {
    content,
    page: 0,
    size: 20,
    totalElements,
    totalPages: Math.ceil(totalElements / 20),
    first: true,
    last: totalElements <= 20,
    empty: content.length === 0,
  }
}

const carga = {
  id: "carga-1",
  activoId: "activo-1",
  insumoId: "insumo-1",
  empleadoId: "empleado-1",
  fechaCarga: "2026-11-10T10:00:00",
  litros: 5,
  precioTotal: 50,
} as CargaCombustible

describe("ConsumoCombustiblePage — totales server-side (REQ-VEH-009)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("muestra 1001 registros agregados aunque la página solo tenga 501", async () => {
    vi.mocked(listCargasCombustible).mockResolvedValue(buildPage(501, [carga]))
    vi.mocked(getGestionVehicularTotales).mockResolvedValue({
      totalRegistros: 1001,
      totalLitros: 750.5,
      totalImporte: 3000.75,
      totalKm: 0,
      fechaDesde: null,
      fechaHasta: null,
    })

    const { Wrapper } = createWrapper()
    render(<ConsumoCombustiblePage />, { wrapper: Wrapper })

    const metricas = await screen.findByTestId("metricas-combustible")
    expect(within(metricas).getByText("1.001")).toBeInTheDocument()
    expect(within(metricas).getByText(/750,50/)).toBeInTheDocument()
    expect(within(metricas).getByText(/3\.000,75/)).toBeInTheDocument()
    expect(within(metricas).queryByText("501")).not.toBeInTheDocument()

    const [modulo, filtros] = vi.mocked(getGestionVehicularTotales).mock.calls[0]
    expect(modulo).toBe("combustible")
    expect(filtros).toEqual(
      expect.objectContaining({
        fechaDesde: expect.stringContaining("T00:00:00"),
        fechaHasta: expect.stringContaining("T23:59:59"),
      })
    )
    expect(filtros).not.toHaveProperty("page")
    expect(filtros).not.toHaveProperty("size")
    expect(filtros).not.toHaveProperty("sortBy")
    expect(filtros).not.toHaveProperty("direction")

    const [filtrosListado] = vi.mocked(listCargasCombustible).mock.calls[0]
    expect(filtrosListado).toEqual(
      expect.objectContaining<CargaCombustibleListFilters>({
        page: 0,
        size: 20,
        sortBy: "fechaCarga",
        direction: "DESC",
      })
    )
    expect(
      (filtrosListado as CargaCombustibleListFilters & GestionVehicularTotalesFiltros)
        .activoId
    ).toBe(filtros?.activoId)
  })

  it("muestra error con reintento y sin ceros ni «sin registros» si /totales falla con 503", async () => {
    vi.mocked(listCargasCombustible).mockResolvedValue(buildPage(1, [carga]))
    vi.mocked(getGestionVehicularTotales).mockRejectedValue(
      new ApiError({
        message: "El servicio no está disponible temporalmente",
        status: 503,
      })
    )

    const { Wrapper } = createWrapper()
    render(<ConsumoCombustiblePage />, { wrapper: Wrapper })

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Error al cargar los totales de combustible")
    expect(alert).toHaveTextContent(
      "El servicio no está disponible temporalmente"
    )
    expect(screen.queryByTestId("metricas-combustible")).not.toBeInTheDocument()
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/No se encontraron registros/)
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Reintentar totales/i }))

    await waitFor(() => {
      expect(getGestionVehicularTotales).toHaveBeenCalledTimes(2)
    })
  })
})
