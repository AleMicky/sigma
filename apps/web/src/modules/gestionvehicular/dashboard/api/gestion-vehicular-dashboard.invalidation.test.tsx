import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { toast } from "sonner"

import { useRegistrarSalidaPorteriaMutation } from "../../porteria/api/porteria.mutations"
import { registrarSalidaPorteria } from "../../porteria/api/porteria.service"
import { useCreateSolicitudVehicular } from "../../solicitud/api/solicitud-vehicular.mutations"
import { createSolicitudVehicular } from "../../solicitud/api/solicitud-vehicular.service"
import { gestionVehicularDashboardKeys } from "./gestion-vehicular-dashboard.queries"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("../../solicitud/api/solicitud-vehicular.service", () => ({
  createSolicitudVehicular: vi.fn(),
  createSolicitudVehicularWithFiles: vi.fn(),
  updateSolicitudVehicular: vi.fn(),
  deleteSolicitudVehicular: vi.fn(),
  enviarSolicitudVehicular: vi.fn(),
}))

vi.mock("../../porteria/api/porteria.service", () => ({
  registrarSalidaPorteria: vi.fn(),
  registrarLlegadaPorteria: vi.fn(),
  anularRegistroPorteria: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(queryClient, "invalidateQueries")

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return { Wrapper, invalidate }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("invalidación del dashboard de gestión vehicular", () => {
  it("al crear una solicitud invalida la clave raíz del dashboard", async () => {
    vi.mocked(createSolicitudVehicular).mockResolvedValue({ id: "sol-1" } as never)
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useCreateSolicitudVehicular(), {
      wrapper: Wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({} as never)
    })

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: gestionVehicularDashboardKeys.all,
      })
    )
  })

  it("al registrar una salida de portería invalida la clave raíz del dashboard", async () => {
    vi.mocked(registrarSalidaPorteria).mockResolvedValue({
      id: "reg-1",
      numero: "REG-001",
      tipoMovimiento: "SALIDA",
    } as never)
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useRegistrarSalidaPorteriaMutation(), {
      wrapper: Wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({} as never)
    })

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: gestionVehicularDashboardKeys.all,
      })
    )
    expect(toast.success).toHaveBeenCalledWith(
      "Salida REG-001 registrada correctamente"
    )
  })
})
