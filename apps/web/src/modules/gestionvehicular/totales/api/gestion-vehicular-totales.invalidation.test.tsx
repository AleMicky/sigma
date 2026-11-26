import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, cleanup, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  useCreateCargaCombustible,
  useDeleteCargaCombustible,
  useUpdateCargaCombustible,
} from "../../carga-combustible/api/carga-combustible.mutations"
import { createCargaCombustible, deleteCargaCombustible, updateCargaCombustible } from "../../carga-combustible/api/carga-combustible.service"
import { gestionVehicularDashboardKeys } from "../../dashboard/api/gestion-vehicular-dashboard.queries"
import {
  useAnularRegistroPorteriaMutation,
  useRegistrarLlegadaPorteriaMutation,
  useRegistrarSalidaPorteriaMutation,
} from "../../porteria/api/porteria.mutations"
import {
  anularRegistroPorteria,
  registrarLlegadaPorteria,
  registrarSalidaPorteria,
} from "../../porteria/api/porteria.service"
import {
  useActualizarSalidaMutation,
  useCancelarSalidaMutation,
  useEjecutarAccionSalidaMutation,
  useRegistrarBitacoraMutation,
  useRegistrarSalidaMutation,
} from "../../salida-vehicular/api/salida-vehicular.mutations"
import {
  actualizarSalida,
  cancelarSalida,
  ejecutarAccion,
  registrarBitacora,
  registrarSalida,
} from "../../salida-vehicular/api/salida-vehicular.service"
import {
  useCompletarWorkflowSolicitudVehicular,
  useCreateSolicitudVehicular,
  useCreateSolicitudVehicularWithFiles,
  useDeleteSolicitudVehicular,
  useEnviarSolicitudVehicular,
  useUpdateSolicitudVehicular,
} from "../../solicitud/api/solicitud-vehicular.mutations"
import {
  completarWorkflowSolicitudVehicular,
  createSolicitudVehicular,
  createSolicitudVehicularWithFiles,
  deleteSolicitudVehicular,
  enviarSolicitudVehicular,
  updateSolicitudVehicular,
} from "../../solicitud/api/solicitud-vehicular.service"
import { gestionVehicularTotalesKeys } from "./gestion-vehicular-totales.queries"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("../../carga-combustible/api/carga-combustible.service", () => ({
  createCargaCombustible: vi.fn(),
  updateCargaCombustible: vi.fn(),
  deleteCargaCombustible: vi.fn(),
}))

vi.mock("../../salida-vehicular/api/salida-vehicular.service", () => ({
  registrarSalida: vi.fn(),
  actualizarSalida: vi.fn(),
  cancelarSalida: vi.fn(),
  ejecutarAccion: vi.fn(),
  registrarBitacora: vi.fn(),
}))

vi.mock("../../solicitud/api/solicitud-vehicular.service", () => ({
  createSolicitudVehicular: vi.fn(),
  createSolicitudVehicularWithFiles: vi.fn(),
  updateSolicitudVehicular: vi.fn(),
  deleteSolicitudVehicular: vi.fn(),
  enviarSolicitudVehicular: vi.fn(),
  completarWorkflowSolicitudVehicular: vi.fn(),
}))

vi.mock("../../porteria/api/porteria.service", () => ({
  registrarSalidaPorteria: vi.fn(),
  registrarLlegadaPorteria: vi.fn(),
  anularRegistroPorteria: vi.fn(),
}))

const entidad = {
  id: "ent-1",
  numero: "REG-001",
  tipoMovimiento: "SALIDA",
}

type MutationHook = () => { mutateAsync: (variables: never) => Promise<unknown> }

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

async function expectTotalesInvalidados(
  useHook: MutationHook,
  variables: unknown
) {
  const { Wrapper, invalidate } = createWrapper()
  const { result } = renderHook(() => useHook(), { wrapper: Wrapper })

  await act(async () => {
    await result.current.mutateAsync(variables as never)
  })

  expect(invalidate).toHaveBeenCalledWith(
    expect.objectContaining({ queryKey: gestionVehicularTotalesKeys.all })
  )
  // La invalidación del dashboard previa no debe desaparecer.
  expect(invalidate).toHaveBeenCalledWith(
    expect.objectContaining({ queryKey: gestionVehicularDashboardKeys.all })
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const service of [
    createCargaCombustible,
    updateCargaCombustible,
    deleteCargaCombustible,
    registrarSalida,
    actualizarSalida,
    cancelarSalida,
    ejecutarAccion,
    registrarBitacora,
    createSolicitudVehicular,
    createSolicitudVehicularWithFiles,
    updateSolicitudVehicular,
    deleteSolicitudVehicular,
    enviarSolicitudVehicular,
    completarWorkflowSolicitudVehicular,
    registrarSalidaPorteria,
    registrarLlegadaPorteria,
    anularRegistroPorteria,
  ]) {
    vi.mocked(service).mockResolvedValue(entidad as never)
  }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("invalidación de la caché de totales de gestión vehicular", () => {
  it("invalida tras crear, actualizar y eliminar carga de combustible", async () => {
    await expectTotalesInvalidados(useCreateCargaCombustible, {})
    await expectTotalesInvalidados(useUpdateCargaCombustible, {
      id: "carga-1",
      payload: {},
    })
    await expectTotalesInvalidados(useDeleteCargaCombustible, "carga-1")
  })

  it("invalida tras registrar, actualizar, cancelar, ejecutar acción y bitácora de salidas", async () => {
    await expectTotalesInvalidados(useRegistrarSalidaMutation, {})
    await expectTotalesInvalidados(useActualizarSalidaMutation, {
      id: "salida-1",
      data: {},
    })
    await expectTotalesInvalidados(useCancelarSalidaMutation, {
      id: "salida-1",
    })
    await expectTotalesInvalidados(useEjecutarAccionSalidaMutation, {
      id: "salida-1",
      accionId: "registrarLlegada",
    })
    await expectTotalesInvalidados(useRegistrarBitacoraMutation, {
      id: "salida-1",
      data: {},
    })
  })

  it("invalida tras todas las mutaciones de solicitudes (incluido el flujo que genera viajes)", async () => {
    await expectTotalesInvalidados(useCreateSolicitudVehicular, {})
    await expectTotalesInvalidados(useCreateSolicitudVehicularWithFiles, {
      payload: {},
    })
    await expectTotalesInvalidados(useUpdateSolicitudVehicular, {
      id: "sol-1",
      payload: {},
    })
    await expectTotalesInvalidados(useDeleteSolicitudVehicular, "sol-1")
    await expectTotalesInvalidados(useEnviarSolicitudVehicular, {
      id: "sol-1",
      payload: { aprobadorId: "user-1" },
    })
    await expectTotalesInvalidados(useCompletarWorkflowSolicitudVehicular, {
      id: "sol-1",
      payload: { variables: {} },
    })
  })

  it("invalida tras registrar salida/llegada y anular en portería", async () => {
    await expectTotalesInvalidados(useRegistrarSalidaPorteriaMutation, {})
    await expectTotalesInvalidados(useRegistrarLlegadaPorteriaMutation, {
      id: "reg-1",
    })
    await expectTotalesInvalidados(useAnularRegistroPorteriaMutation, {
      id: "reg-1",
    })
  })
})
