import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/shared/api/errors"
import type { PageResponse } from "@/shared/types/api.types"

import {
  listViajes,
  type ViajeVehicular,
  type ViajeVehicularFiltros,
} from "../api/viaje-vehicular.service"
import { getGestionVehicularTotales } from "../../totales/api/gestion-vehicular-totales.service"
import { HistorialViajesPage } from "./HistorialViajesPage"

vi.mock("../api/viaje-vehicular.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/viaje-vehicular.service")>()
  return {
    ...actual,
    listViajes: vi.fn(),
    exportarViajesExcel: vi.fn(),
  }
})

vi.mock("../../totales/api/gestion-vehicular-totales.service", () => ({
  getGestionVehicularTotales: vi.fn(),
}))

vi.mock("../components/HistorialViajesFiltrosBar", () => ({
  HistorialViajesFiltrosBar: () => <div data-testid="filtros-viajes" />,
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
  content: ViajeVehicular[]
): PageResponse<ViajeVehicular> {
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

const viaje = {
  id: "viaje-1",
  asignacionVehicularId: "asignacion-1",
  estado: "FINALIZADO",
  kilometrajeSalida: 100,
  kilometrajeRetorno: 150,
  kilometrajeRecorrido: 50,
} as ViajeVehicular

describe("HistorialViajesPage — totales server-side (REQ-VEH-009)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("muestra los agregados del servidor (1001 viajes / 7500 km) aunque la página tenga 501", async () => {
    vi.mocked(listViajes).mockResolvedValue(buildPage(501, [viaje]))
    vi.mocked(getGestionVehicularTotales).mockResolvedValue({
      totalRegistros: 1001,
      totalLitros: 0,
      totalImporte: 0,
      totalKm: 7500,
      fechaDesde: null,
      fechaHasta: null,
    })

    const { Wrapper } = createWrapper()
    render(<HistorialViajesPage />, { wrapper: Wrapper })

    const metricas = await screen.findByTestId("metricas-viajes")
    expect(within(metricas).getByText("1.001")).toBeInTheDocument()
    expect(within(metricas).getByText(/7\.500/)).toBeInTheDocument()
    expect(within(metricas).queryByText("501")).not.toBeInTheDocument()

    const [modulo, filtros] = vi.mocked(getGestionVehicularTotales).mock.calls[0]
    expect(modulo).toBe("viajes")
    expect(filtros).not.toHaveProperty("page")
    expect(filtros).not.toHaveProperty("size")
    expect(filtros).not.toHaveProperty("sortBy")
    expect(filtros).not.toHaveProperty("direction")

    const [filtrosListado] = vi.mocked(listViajes).mock.calls[0]
    expect(filtrosListado).toEqual(
      expect.objectContaining<ViajeVehicularFiltros>({
        page: 0,
        size: 20,
        sortBy: "createdAt",
        direction: "DESC",
      })
    )
  })

  it("muestra error con reintento y sin ceros ni «sin registros» si /totales falla con 503", async () => {
    vi.mocked(listViajes).mockResolvedValue(buildPage(1, [viaje]))
    vi.mocked(getGestionVehicularTotales).mockRejectedValue(
      new ApiError({
        message: "El servicio no está disponible temporalmente",
        status: 503,
      })
    )

    const { Wrapper } = createWrapper()
    render(<HistorialViajesPage />, { wrapper: Wrapper })

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Error al cargar los totales de viajes")
    expect(alert).toHaveTextContent(
      "El servicio no está disponible temporalmente"
    )
    expect(screen.queryByTestId("metricas-viajes")).not.toBeInTheDocument()
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/No se encontraron viajes con los filtros/)
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Reintentar totales/i }))

    await waitFor(() => {
      expect(getGestionVehicularTotales).toHaveBeenCalledTimes(2)
    })
  })
})
