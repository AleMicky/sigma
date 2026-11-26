import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/shared/api/errors"

import { getGestionVehicularDashboard } from "../api/gestion-vehicular-dashboard.service"
import { GestionVehicularDashboardPage } from "./GestionVehicularDashboardPage"

vi.mock("../api/gestion-vehicular-dashboard.service", () => ({
  getGestionVehicularDashboard: vi.fn(),
}))

vi.mock("../components/GestionVehicularDashboardHeader", () => ({
  GestionVehicularDashboardHeader: () => <div>Encabezado del dashboard</div>,
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

  return { Wrapper, queryClient }
}

describe("GestionVehicularDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("muestra error y reintento sin caer a cero cuando la API responde 503", async () => {
    vi.mocked(getGestionVehicularDashboard).mockRejectedValue(
      new ApiError({
        message: "El servicio no está disponible temporalmente",
        status: 503,
      })
    )

    const { Wrapper } = createWrapper()
    render(<GestionVehicularDashboardPage />, { wrapper: Wrapper })

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Error al cargar indicadores")
    expect(alert).toHaveTextContent(
      "El servicio no está disponible temporalmente"
    )
    expect(
      screen.getByRole("button", { name: /Reintentar/i })
    ).toBeInTheDocument()

    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument()
    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }))

    await waitFor(() => {
      expect(getGestionVehicularDashboard).toHaveBeenCalledTimes(2)
    })
  })
})
