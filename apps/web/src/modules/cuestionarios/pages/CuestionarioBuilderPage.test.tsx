import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAuthStore } from "@/app/store/auth.store"

import { cuestionarioService } from "../api/cuestionario.service"
import type { CuestionarioDetalle } from "../api/cuestionario.types"
import { CuestionarioBuilderPage } from "./CuestionarioBuilderPage"

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
  }
})

vi.mock("../api/cuestionario.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/cuestionario.service")>()
  return {
    ...actual,
    cuestionarioService: {
      ...actual.cuestionarioService,
      get: vi.fn(),
      guardarPreguntas: vi.fn(),
      nuevaVersion: vi.fn(),
      publicar: vi.fn(),
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

const baseDetail: CuestionarioDetalle = {
  id: "cuest-1",
  codigo: "EVAL-COND",
  nombre: "Evaluación de Conductores",
  descripcion: "Cuestionario de satisfacción de viaje",
  moduloOrigen: "GESTION_VEHICULAR",
  entidadTipo: "SOLICITUD_VEHICULAR",
  eventoDisparador: "SOLICITUD_FINALIZADA",
  version: 1,
  estado: "BORRADOR",
  obligatorio: true,
  anonimoEnReportes: false,
  activo: true,
  totalRespuestas: 0,
  createdAt: "2026-11-01T10:00:00",
  updatedAt: "2026-11-01T10:00:00",
  preguntas: [
    {
      id: "p1",
      seccion: "Seguridad",
      orden: 1,
      enunciado: "Respeto a normas de tránsito",
      descripcionAyuda: null,
      tipoPregunta: "ESTRELLAS_1_5",
      obligatoria: true,
      peso: 1,
      configJson: null,
      activo: true,
      opciones: [],
    },
  ],
}

describe("CuestionarioBuilderPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: {
        id: "admin-1",
        username: "admin",
        email: "admin@corani.bo",
        name: "Administrador",
        roles: ["ADMIN"],
      },
      isAuthenticated: true,
    })
    vi.mocked(cuestionarioService.get).mockResolvedValue(baseDetail)
    vi.mocked(cuestionarioService.guardarPreguntas).mockResolvedValue(baseDetail)
  })

  afterEach(() => {
    cleanup()
  })

  it("permite agregar preguntas, reordenar y guardar de forma atómica", async () => {
    render(<CuestionarioBuilderPage cuestionarioId="cuest-1" />, {
      wrapper: createWrapper(),
    })

    expect(
      await screen.findByText("Evaluación de Conductores"),
    ).toBeInTheDocument()

    // Agregar una nueva pregunta
    fireEvent.click(screen.getByRole("button", { name: /^Agregar pregunta$/i }))

    const inputsEnunciado = screen.getAllByPlaceholderText(
      /Cómo calificas la puntualidad/i,
    )
    expect(inputsEnunciado).toHaveLength(2)

    fireEvent.change(inputsEnunciado[1], {
      target: { value: "Limpieza del vehículo" },
    })

    // Subir la segunda pregunta al primer lugar
    fireEvent.click(screen.getByRole("button", { name: "Subir pregunta 2" }))

    fireEvent.click(
      screen.getByRole("button", { name: /Guardar preguntas/i }),
    )

    await waitFor(() => {
      expect(cuestionarioService.guardarPreguntas).toHaveBeenCalledTimes(1)
    })

    const [, payload] = vi.mocked(cuestionarioService.guardarPreguntas).mock
      .calls[0]
    expect(payload.preguntas).toHaveLength(2)
    expect(payload.preguntas[0].enunciado).toBe("Limpieza del vehículo")
    expect(payload.preguntas[0].orden).toBe(1)
    expect(payload.preguntas[1].enunciado).toBe("Respeto a normas de tránsito")
    expect(payload.preguntas[1].orden).toBe(2)
  })

  it("muestra aviso y CTA de nueva versión cuando ya existen respuestas", async () => {
    vi.mocked(cuestionarioService.get).mockResolvedValue({
      ...baseDetail,
      estado: "PUBLICADO",
      totalRespuestas: 12,
    })

    render(<CuestionarioBuilderPage cuestionarioId="cuest-1" />, {
      wrapper: createWrapper(),
    })

    expect(
      await screen.findByText(/ya cuenta con 12 respuesta\(s\) registrada\(s\)/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Guardar preguntas/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole("button", { name: /Crear nueva versión/i }).length,
    ).toBeGreaterThanOrEqual(1)
  })
})
