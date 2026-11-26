import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/shared/api/errors"
import type { PageResponse } from "@/shared/types/api.types"

import {
  getReporteSolicitudesVehiculares,
  listSolicitudesVehiculares,
  type ReporteSolicitudesGeneralResponse,
  type SolicitudVehicular,
} from "../api/solicitud-vehicular.service"
import { SolicitudesVehicularesPage } from "./SolicitudesVehicularesPage"

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    useSearch: () => ({}),
    useNavigate: () => vi.fn(),
    Link: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  }
})

vi.mock("../api/solicitud-vehicular.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/solicitud-vehicular.service")>()
  return {
    ...actual,
    listSolicitudesVehiculares: vi.fn(),
    getReporteSolicitudesVehiculares: vi.fn(),
  }
})

vi.mock("../api/solicitud-vehicular.mutations", () => ({
  useCompletarWorkflowSolicitudVehicular: () => ({ mutateAsync: vi.fn() }),
  useDeleteSolicitudVehicular: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock("@/modules/gestionvehicular/tipo-solicitud/api/tipo-solicitud.queries", () => ({
  tipoSolicitudVehicularQueries: {
    list: () => ({
      queryKey: ["tipos-solicitud-vehicular", "test"],
      queryFn: async () => ({ content: [] }),
    }),
  },
}))

vi.mock("@/modules/workflow", () => ({
  WorkflowActionDialog: () => null,
  WorkflowHistoryDialog: () => null,
  useWorkflowActionTarget: () => ({
    target: null,
    isOpen: false,
    openAction: vi.fn(),
    closeAction: vi.fn(),
  }),
}))

vi.mock("../components/SolicitudVehicularHeader", () => ({
  SolicitudVehicularHeader: () => <div data-testid="header-solicitudes" />,
}))

vi.mock("../components/SolicitudVehicularFilterToolbar", () => ({
  SolicitudVehicularFilterToolbar: () => <div data-testid="filtros-solicitudes" />,
}))

vi.mock("../components/SolicitudVehicularDetailSheet", () => ({
  SolicitudVehicularDetailSheet: () => null,
}))

vi.mock("../components/SolicitudVehicularListItem", () => ({
  SolicitudVehicularListItem: () => <div data-testid="solicitud-item" />,
  SolicitudVehicularListItemSkeleton: () => <div data-testid="solicitud-skeleton" />,
}))

vi.mock("@/shared/components/confirm-delete-dialog", () => ({
  ConfirmDeleteDialog: () => null,
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

function buildSolicitud(index: number): SolicitudVehicular {
  return {
    id: `sol-${index}`,
    numero: `SOL-${index}`,
    tipoSolicitudVehicularId: "tipo-1",
    solicitanteId: "user-1",
    motivo: "Comisión de servicio",
    destino: "Corani",
    fechaSalida: "2026-11-10T08:00:00",
    fechaRetornoEstimada: "2026-11-11T18:00:00",
    cantidadPasajeros: 1,
    estado: "SOLICITADO",
  } as SolicitudVehicular
}

function buildPage(
  totalElements: number,
  content: SolicitudVehicular[]
): PageResponse<SolicitudVehicular> {
  return {
    content,
    page: 0,
    size: content.length || 20,
    totalElements,
    totalPages: Math.ceil(totalElements / 20),
    first: true,
    last: false,
    empty: content.length === 0,
  }
}

const filas = Array.from({ length: 1001 }, (_, index) => buildSolicitud(index))

describe("SolicitudesVehicularesPage — KPIs con agregados del servidor (REQ-VEH-009)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listSolicitudesVehiculares).mockResolvedValue(buildPage(1001, filas))
    vi.mocked(getReporteSolicitudesVehiculares).mockResolvedValue({
      totalSolicitudes: 1001,
      solicitudesBorrador: 7,
      solicitudesPendientes: 11,
      solicitudesAsignadas: 13,
      solicitudesEnCurso: 17,
      solicitudesFinalizadas: 19,
      solicitudesRechazadas: 3,
      totalPasajeros: 77,
      items: filas,
    } as ReporteSolicitudesGeneralResponse)
  })

  afterEach(() => {
    cleanup()
  })

  it("muestra los agregados del reporte aunque haya 1001 filas en la lista", async () => {
    const { Wrapper } = createWrapper()
    render(<SolicitudesVehicularesPage />, { wrapper: Wrapper })

    expect(await within(screen.getByRole("button", { name: /^Total/ })).findByText("1001")).toBeInTheDocument()
    expect(
      within(screen.getByRole("button", { name: /Borradores/i })).getByText("7")
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole("button", { name: /Por Revisar/i })).getByText("11")
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole("button", { name: /Aprobados/i })).getByText("13")
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole("button", { name: /En Ruta/i })).getByText("17")
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole("button", { name: /Finalizadas/i })).getByText("19")
    ).toBeInTheDocument()

    expect(getReporteSolicitudesVehiculares).toHaveBeenCalledTimes(1)
    const [filtrosListado] = vi.mocked(listSolicitudesVehiculares).mock.calls[0]
    expect(filtrosListado?.size).not.toBe(1000)
  })

  it("anuncia el 503 del reporte, sin ceros ni KPIs, y permite reintentar", async () => {
    vi.mocked(listSolicitudesVehiculares).mockResolvedValue(buildPage(1, [filas[0]]))
    vi.mocked(getReporteSolicitudesVehiculares).mockRejectedValue(
      new ApiError({
        message: "El servicio no está disponible temporalmente",
        status: 503,
      })
    )

    const { Wrapper } = createWrapper()
    render(<SolicitudesVehicularesPage />, { wrapper: Wrapper })

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Error al cargar los indicadores de solicitudes")
    expect(alert).toHaveTextContent("El servicio no está disponible temporalmente")
    expect(
      screen.queryByRole("button", { name: /Borradores/i })
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument()

    fireEvent.click(
      within(alert).getByRole("button", { name: /Reintentar métricas/i })
    )

    await waitFor(() => {
      expect(getReporteSolicitudesVehiculares).toHaveBeenCalledTimes(2)
    })
  })
})
