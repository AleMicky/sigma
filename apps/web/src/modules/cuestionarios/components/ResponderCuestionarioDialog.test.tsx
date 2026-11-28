import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { cuestionarioService } from "../api/cuestionario.service"
import type { AsignacionDetalle } from "../api/cuestionario.types"
import { ResponderCuestionarioDialog } from "./ResponderCuestionarioDialog"

vi.mock("../api/cuestionario.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/cuestionario.service")>()
  return {
    ...actual,
    cuestionarioService: {
      ...actual.cuestionarioService,
      getAsignacion: vi.fn(),
      responderAsignacion: vi.fn(),
    },
  }
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

const sampleDetail: AsignacionDetalle = {
  asignacion: {
    id: "asig-1",
    cuestionarioId: "cuest-1",
    cuestionarioNombre: "Evaluación de Conductor",
    cuestionarioCodigo: "EVAL-COND",
    cuestionarioVersion: 1,
    moduloOrigen: "GESTION_VEHICULAR",
    entidadTipo: "SOLICITUD_VEHICULAR",
    entidadId: "sol-1",
    entidadCodigoRef: "SOL-2026-001",
    evaluadoTipo: "CONDUCTOR",
    evaluadoId: "cond-1",
    evaluadoNombre: "Carlos Mamani",
    evaluadorEmpleadoId: "emp-1",
    evaluadorNombre: "Ana Pérez",
    obligatorio: true,
    anonimoEnReportes: true,
    estado: "PENDIENTE",
    fechaHabilitacion: "2026-11-20T10:00:00",
    fechaRespuesta: null,
    puntajeTotal: null,
    puntajeMaximo: null,
    porcentaje: null,
    comentarioGeneral: null,
  },
  cuestionario: {
    id: "cuest-1",
    codigo: "EVAL-COND",
    nombre: "Evaluación de Conductor",
    descripcion: "Califica el servicio recibido durante el viaje.",
    moduloOrigen: "GESTION_VEHICULAR",
    entidadTipo: "SOLICITUD_VEHICULAR",
    eventoDisparador: "SOLICITUD_FINALIZADA",
    version: 1,
    estado: "PUBLICADO",
    obligatorio: true,
    anonimoEnReportes: true,
    activo: true,
    totalRespuestas: 0,
    createdAt: "2026-11-01T08:00:00",
    updatedAt: "2026-11-01T08:00:00",
    preguntas: [
      {
        id: "p1",
        seccion: "Servicio",
        orden: 1,
        enunciado: "¿Cómo calificas la conducción?",
        descripcionAyuda: "Selecciona de 1 a 5 estrellas",
        tipoPregunta: "ESTRELLAS_1_5",
        obligatoria: true,
        peso: 1,
        configJson: null,
        activo: true,
        opciones: [],
      },
      {
        id: "p2",
        seccion: "Servicio",
        orden: 2,
        enunciado: "¿Llegó a tiempo?",
        descripcionAyuda: null,
        tipoPregunta: "SI_NO",
        obligatoria: true,
        peso: 1,
        configJson: null,
        activo: true,
        opciones: [],
      },
    ],
  },
  respuestas: [],
}

describe("ResponderCuestionarioDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cuestionarioService.getAsignacion).mockResolvedValue(sampleDetail)
    vi.mocked(cuestionarioService.responderAsignacion).mockResolvedValue({
      ...sampleDetail,
      asignacion: {
        ...sampleDetail.asignacion,
        estado: "RESPONDIDO",
        porcentaje: 100,
      },
    })
  })

  afterEach(() => {
    cleanup()
  })

  it("valida preguntas obligatorias antes de enviar y luego envía el payload correcto", async () => {
    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()

    render(
      <ResponderCuestionarioDialog
        asignacionId="asig-1"
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
      { wrapper: createWrapper() },
    )

    expect(
      await screen.findByText("Evaluación de Conductor"),
    ).toBeInTheDocument()
    expect(screen.getByText(/Carlos Mamani/)).toBeInTheDocument()

    // Intentar enviar sin responder obligatorias
    fireEvent.click(screen.getByRole("button", { name: /Enviar evaluación/i }))

    expect(
      await screen.findByText(
        /Completa todas las preguntas obligatorias antes de enviar/i,
      ),
    ).toBeInTheDocument()
    expect(cuestionarioService.responderAsignacion).not.toHaveBeenCalled()

    // Responder ambas obligatorias
    fireEvent.click(screen.getByRole("radio", { name: "5 estrellas de 5" }))
    fireEvent.click(screen.getByRole("radio", { name: "Sí" }))

    expect(screen.getByText("100%")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Enviar evaluación/i }))

    await waitFor(() => {
      expect(cuestionarioService.responderAsignacion).toHaveBeenCalledWith(
        "asig-1",
        {
          respuestas: [
            { preguntaId: "p1", valorNumerico: 5 },
            { preguntaId: "p2", valorBooleano: true },
          ],
        },
      )
    })

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
