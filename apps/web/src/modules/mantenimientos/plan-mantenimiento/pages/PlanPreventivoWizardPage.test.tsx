import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { listActivos, type Activo } from "@/modules/activos/activo/api/activo.service"
import {
  listTiposActivo,
  type TipoActivo,
} from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { PageResponse } from "@/shared/types/api.types"

import {
  listActividadAplicaciones,
  type ActividadAplicacion,
} from "../../actividad/api/actividad-aplicacion.service"
import {
  listTiposMantenimiento,
  type TipoMantenimiento,
} from "../../tipo-mantenimiento/api/tipo-mantenimiento.service"
import {
  createPlanPreventivoCompleto,
  getPlanPreventivoCompleto,
  updatePlanPreventivoCompleto,
  type PlanPreventivoCompletoResponse,
} from "../api/plan-preventivo.service"
import { PlanPreventivoWizardPage } from "./PlanPreventivoWizardPage"

const { navigateMock, historyBackMock, toastSuccess, toastError } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  historyBackMock: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useRouter: () => ({ history: { back: historyBackMock } }),
  }
})

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}))

vi.mock("@/modules/activos/tipo-activo/api/tipo-activo.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/modules/activos/tipo-activo/api/tipo-activo.service")>()
  return {
    ...actual,
    listTiposActivo: vi.fn(),
  }
})

vi.mock(
  "@/modules/mantenimientos/tipo-mantenimiento/api/tipo-mantenimiento.service",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/modules/mantenimientos/tipo-mantenimiento/api/tipo-mantenimiento.service")
      >()
    return {
      ...actual,
      listTiposMantenimiento: vi.fn(),
    }
  },
)

vi.mock(
  "@/modules/mantenimientos/actividad/api/actividad-aplicacion.service",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/modules/mantenimientos/actividad/api/actividad-aplicacion.service")
      >()
    return {
      ...actual,
      listActividadAplicaciones: vi.fn(),
    }
  },
)

vi.mock("@/modules/activos/activo/api/activo.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/modules/activos/activo/api/activo.service")>()
  return {
    ...actual,
    listActivos: vi.fn(),
  }
})

vi.mock("../api/plan-preventivo.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/plan-preventivo.service")>()
  return {
    ...actual,
    getPlanPreventivoCompleto: vi.fn(),
    createPlanPreventivoCompleto: vi.fn(),
    updatePlanPreventivoCompleto: vi.fn(),
  }
})

function buildPage<T>(content: T[]): PageResponse<T> {
  return {
    content,
    page: 0,
    size: content.length || 20,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  }
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return { Wrapper }
}

const TIPO_ACTIVO_VEHI: TipoActivo = {
  id: "tipo-veh-1",
  categoriaId: "cat-1",
  nombre: "Vehículo",
  descripcion: null,
  color: null,
  icono: null,
}

const TIPO_MANT_PREV: TipoMantenimiento = {
  id: "tm-1",
  codigo: "PREV",
  nombre: "Preventivo",
  descripcion: null,
}

const APLICACIONES_MOCK: ActividadAplicacion[] = [
  {
    id: "app-1",
    actividadMantenimientoId: "act-m-1",
    actividad: {
      id: "act-m-1",
      codigo: "ACT-ACEITE",
      nombre: "Cambio de aceite de motor",
    },
    tipoActivo: { id: "tipo-veh-1", nombre: "Vehículo" },
  },
  {
    id: "app-2",
    actividadMantenimientoId: "act-m-2",
    actividad: {
      id: "act-m-2",
      codigo: "ACT-FRENOS",
      nombre: "Inspección de frenos",
    },
    tipoActivo: { id: "tipo-veh-1", nombre: "Vehículo" },
  },
]

const ACTIVOS_MOCK: Activo[] = [
  {
    id: "activo-1",
    codigo: "VEH-001",
    codigoAlternativo: null,
    nombre: "Camioneta Hilux 4x4",
    descripcion: null,
    tipoActivoId: "tipo-veh-1",
    ubicacionId: null,
    estadoOperativoId: null,
    fechaAdquisicion: null,
    urlImagen: null,
    activo: true,
  },
  {
    id: "activo-2",
    codigo: "VEH-002",
    codigoAlternativo: null,
    nombre: "Camión Grúa 02",
    descripcion: null,
    tipoActivoId: "tipo-veh-1",
    ubicacionId: null,
    estadoOperativoId: null,
    fechaAdquisicion: null,
    urlImagen: null,
    activo: true,
  },
]

const PLAN_COMPLETO_EDIT: PlanPreventivoCompletoResponse = {
  plan: {
    id: "plan-edit-1",
    codigo: "PREV-VEHI-90D",
    nombre: "Mantenimiento Trimestral Flota",
    descripcion: "Revisión general cada 90 días",
    tipoActivoId: "tipo-veh-1",
  },
  estado: "ACTIVO",
  tipoMantenimientoId: "tm-1",
  criterioDefaultTipo: "TIEMPO",
  criterioDefaultDias: 90,
  criterioDefaultUso: null,
  actividades: [
    {
      id: "plan-act-1",
      actividadMantenimientoAplicacionId: "app-1",
      orden: 1,
      obligatorio: true,
    },
  ],
  activos: [
    {
      planMantenimientoActivoId: "pma-1",
      programacionMantenimientoId: "prog-1",
      activoId: "activo-1",
      responsableId: null,
      fechaInicio: "2026-11-01",
      fechaFin: null,
      activo: true,
    },
  ],
}

describe("PlanPreventivoWizardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listTiposActivo).mockResolvedValue(buildPage([TIPO_ACTIVO_VEHI]))
    vi.mocked(listTiposMantenimiento).mockResolvedValue(buildPage([TIPO_MANT_PREV]))
    vi.mocked(listActividadAplicaciones).mockResolvedValue(buildPage(APLICACIONES_MOCK))
    vi.mocked(listActivos).mockResolvedValue(buildPage(ACTIVOS_MOCK))
    vi.mocked(createPlanPreventivoCompleto).mockResolvedValue(PLAN_COMPLETO_EDIT)
    vi.mocked(updatePlanPreventivoCompleto).mockResolvedValue(PLAN_COMPLETO_EDIT)
    vi.mocked(getPlanPreventivoCompleto).mockResolvedValue(PLAN_COMPLETO_EDIT)
  })

  afterEach(() => {
    cleanup()
  })

  it("renderiza en modo creación sin clases que bloqueen el scroll en PageShell y conserva los 3 pasos", async () => {
    const { Wrapper } = createWrapper()
    const { container } = render(<PlanPreventivoWizardPage />, { wrapper: Wrapper })

    expect(
      screen.getByRole("heading", { name: /nuevo plan de mantenimiento preventivo/i }),
    ).toBeInTheDocument()

    const pageShell = container.firstElementChild as HTMLElement
    expect(pageShell).not.toBeNull()
    expect(pageShell.className).toContain("flex-1")
    expect(pageShell.className).not.toContain("overflow-hidden")
    expect(pageShell.className).not.toContain("h-full")

    const nav = screen.getByRole("navigation", { name: /pasos del plan preventivo/i })
    const stepButtons = within(nav).getAllByRole("button")
    expect(stepButtons).toHaveLength(3)
    expect(stepButtons[0]).toHaveAttribute("aria-current", "step")
    expect(stepButtons[0]).toHaveTextContent("1. Qué y cada cuánto")
    expect(stepButtons[1]).toHaveTextContent("2. Qué tareas hacer")
    expect(stepButtons[2]).toHaveTextContent("3. A qué activos")

    // No dispara consulta de activos hasta elegir tipoActivoId
    await waitFor(() => {
      expect(listTiposActivo).toHaveBeenCalledTimes(1)
    })
    expect(listActivos).not.toHaveBeenCalled()
  })

  it("muestra errores inline con role='alert' y aria-invalid en Paso 1, los limpia al editar y permite reintentar catálogos", async () => {
    vi.mocked(listTiposActivo)
      .mockRejectedValueOnce(new Error("Fallo catálogo tipos"))
      .mockResolvedValueOnce(buildPage([TIPO_ACTIVO_VEHI]))

    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<PlanPreventivoWizardPage />, { wrapper: Wrapper })

    // Banner de error al cargar tipos de activo + Reintentar
    const catalogAlert = await screen.findByRole("alert")
    expect(catalogAlert).toHaveTextContent(/fallo catálogo tipos/i)
    await user.click(within(catalogAlert).getByRole("button", { name: /reintentar/i }))

    await waitFor(() => {
      expect(listTiposActivo).toHaveBeenCalledTimes(2)
    })

    // Validación Paso 1
    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))

    expect(await screen.findByText("El tipo de activo es obligatorio")).toBeInTheDocument()
    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument()
    expect(screen.getByText("El código es obligatorio")).toBeInTheDocument()

    const nombreInput = screen.getByLabelText(/nombre del plan/i)
    const codigoInput = screen.getByLabelText(/código único/i)
    const tipoInput = screen.getByRole("combobox", { name: /tipo de activo/i })

    expect(nombreInput).toHaveAttribute("aria-invalid", "true")
    expect(codigoInput).toHaveAttribute("aria-invalid", "true")
    expect(tipoInput).toHaveAttribute("aria-invalid", "true")

    // Al editar nombre y generar código, los errores correspondientes se limpian
    await user.type(nombreInput, "Plan Preventivo 5000")
    expect(screen.queryByText("El nombre es obligatorio")).not.toBeInTheDocument()
    expect(nombreInput).toHaveAttribute("aria-invalid", "false")

    await user.click(screen.getByRole("button", { name: /generar automático/i }))
    expect(screen.queryByText("El código es obligatorio")).not.toBeInTheDocument()
    expect(codigoInput).toHaveAttribute("aria-invalid", "false")

    await user.click(tipoInput)
    await user.click(await screen.findByRole("option", { name: "Vehículo" }))
    expect(screen.queryByText("El tipo de activo es obligatorio")).not.toBeInTheDocument()
  })

  it("completa el flujo de 3 pasos sin contenedores scrollables anidados, asocia labels en Paso 3 y envía el payload", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<PlanPreventivoWizardPage />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(listTiposActivo).toHaveBeenCalledTimes(1)
    })

    // Paso 1
    const tipoCombo = screen.getByRole("combobox", { name: /tipo de activo/i })
    await user.click(tipoCombo)
    await user.click(await screen.findByRole("option", { name: "Vehículo" }))

    await user.type(screen.getByLabelText(/nombre del plan/i), "Servicio 5,000 km")
    await user.type(screen.getByLabelText(/código único/i), "PREV-VEH-5K")

    const radioGroup = screen.getByRole("radiogroup", { name: /criterio de control/i })
    const kmRadio = within(radioGroup).getByRole("radio", { name: /por kilometraje/i })
    await user.click(kmRadio)
    expect(kmRadio).toHaveAttribute("aria-checked", "true")

    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))

    // Paso 2
    const actItemText = await screen.findByText("Cambio de aceite de motor")
    const actListContainer = actItemText.closest("div.space-y-2") as HTMLElement
    expect(actListContainer).not.toBeNull()
    expect(actListContainer.className).not.toContain("overflow-y-auto")
    expect(actListContainer.className).not.toContain("max-h-80")
    expect(actListContainer.className).not.toContain("max-h-96")

    const actCheckbox = screen.getByRole("checkbox", { name: /cambio de aceite de motor/i })
    await user.click(actCheckbox)
    expect(actCheckbox).toBeChecked()

    const obligatoriaBtn = screen.getByRole("button", { name: "Obligatoria" })
    expect(obligatoriaBtn).toHaveAttribute("aria-pressed", "true")
    await user.click(obligatoriaBtn)
    expect(screen.getByRole("button", { name: "Opcional" })).toHaveAttribute("aria-pressed", "false")

    await user.click(screen.getByRole("button", { name: /siguiente: elegir activos/i }))

    // Paso 3
    const assetItemText = await screen.findByText("Camioneta Hilux 4x4")
    const assetListContainer = assetItemText.closest("div.space-y-2") as HTMLElement
    expect(assetListContainer).not.toBeNull()
    expect(assetListContainer.className).not.toContain("overflow-y-auto")
    expect(assetListContainer.className).not.toContain("max-h-80")
    expect(assetListContainer.className).not.toContain("max-h-96")

    const assetCheckbox = screen.getByRole("checkbox", { name: /camioneta hilux 4x4/i })
    await user.click(assetCheckbox)
    expect(assetCheckbox).toBeChecked()

    const fechaInput = screen.getByLabelText(/fecha de inicio/i)
    const kmInput = screen.getByLabelText(/km actual/i)
    fireEvent.change(fechaInput, { target: { value: "2026-12-01" } })
    await user.type(kmInput, "45000")

    await user.click(screen.getByRole("button", { name: /guardar y activar plan/i }))

    await waitFor(() => {
      expect(createPlanPreventivoCompleto).toHaveBeenCalledTimes(1)
    })

    expect(createPlanPreventivoCompleto).toHaveBeenCalledWith({
      tipoActivoId: "tipo-veh-1",
      tipoMantenimientoId: null,
      codigo: "PREV-VEH-5K",
      nombre: "Servicio 5,000 km",
      descripcion: null,
      estado: "ACTIVO",
      criterioDefaultTipo: "KILOMETRAJE",
      criterioDefaultDias: null,
      criterioDefaultUso: 5000,
      actividades: [
        {
          actividadMantenimientoAplicacionId: "app-1",
          orden: 1,
          obligatorio: false,
        },
      ],
      activos: [
        {
          activoId: "activo-1",
          fechaInicio: "2026-12-01",
          activo: true,
          kilometrajeInicial: 45000,
          horasUsoInicial: null,
        },
      ],
    })
    expect(toastSuccess).toHaveBeenCalled()
  })

  it("maneja errores con Reintentar y estado vacío de búsqueda con Limpiar búsqueda en Pasos 2 y 3", async () => {
    vi.mocked(listActividadAplicaciones)
      .mockRejectedValueOnce(new Error("Error cargando actividades"))
      .mockResolvedValueOnce(buildPage(APLICACIONES_MOCK))

    vi.mocked(listActivos)
      .mockRejectedValueOnce(new Error("Error cargando activos"))
      .mockResolvedValueOnce(buildPage(ACTIVOS_MOCK))

    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<PlanPreventivoWizardPage />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(listTiposActivo).toHaveBeenCalledTimes(1)
    })

    // Completar Paso 1
    await user.click(screen.getByRole("combobox", { name: /tipo de activo/i }))
    await user.click(await screen.findByRole("option", { name: "Vehículo" }))
    await user.type(screen.getByLabelText(/nombre del plan/i), "Plan Prueba")
    await user.type(screen.getByLabelText(/código único/i), "PREV-TEST")
    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))

    // Paso 2 error + retry
    const step2Alert = await screen.findByRole("alert")
    expect(step2Alert).toHaveTextContent(/error cargando actividades/i)
    await user.click(within(step2Alert).getByRole("button", { name: /reintentar/i }))

    expect(await screen.findByText("Cambio de aceite de motor")).toBeInTheDocument()

    // Paso 2 búsqueda sin resultados + limpiar búsqueda
    const searchAct = screen.getByPlaceholderText(/buscar actividad/i)
    await user.type(searchAct, "inexistente")
    expect(await screen.findByText(/sin resultados para la búsqueda/i)).toBeInTheDocument()
    const clearActButtons = screen.getAllByRole("button", { name: /limpiar búsqueda/i })
    await user.click(clearActButtons[clearActButtons.length - 1])
    expect(await screen.findByText("Cambio de aceite de motor")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /siguiente: elegir activos/i }))

    // Paso 3 error + retry
    const step3Alert = await screen.findByRole("alert")
    expect(step3Alert).toHaveTextContent(/error cargando activos/i)
    await user.click(within(step3Alert).getByRole("button", { name: /reintentar/i }))

    expect(await screen.findByText("Camioneta Hilux 4x4")).toBeInTheDocument()

    // Paso 3 búsqueda sin resultados + limpiar búsqueda
    const searchActivo = screen.getByPlaceholderText(/buscar activo/i)
    await user.type(searchActivo, "zzz-no-existe")
    expect(await screen.findByText(/sin resultados para la búsqueda/i)).toBeInTheDocument()
    const clearActivoButtons = screen.getAllByRole("button", { name: /limpiar búsqueda/i })
    await user.click(clearActivoButtons[clearActivoButtons.length - 1])
    expect(await screen.findByText("Camioneta Hilux 4x4")).toBeInTheDocument()
  })

  it("carga, hidrata, maneja error con Reintentar y actualiza en modo edición", async () => {
    vi.mocked(getPlanPreventivoCompleto)
      .mockRejectedValueOnce(new Error("Plan no disponible"))
      .mockResolvedValueOnce(PLAN_COMPLETO_EDIT)

    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<PlanPreventivoWizardPage planId="plan-edit-1" />, { wrapper: Wrapper })

    const editAlert = await screen.findByRole("alert")
    expect(editAlert).toHaveTextContent(/plan no disponible/i)
    await user.click(within(editAlert).getByRole("button", { name: /reintentar/i }))

    expect(
      await screen.findByRole("heading", { name: /editar plan preventivo/i }),
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue("Mantenimiento Trimestral Flota")).toBeInTheDocument()
    expect(screen.getByDisplayValue("PREV-VEHI-90D")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))
    await user.click(await screen.findByRole("button", { name: /siguiente: elegir activos/i }))

    await user.click(await screen.findByRole("button", { name: /guardar cambios del plan/i }))

    await waitFor(() => {
      expect(updatePlanPreventivoCompleto).toHaveBeenCalledTimes(1)
    })
    expect(updatePlanPreventivoCompleto).toHaveBeenCalledWith(
      "plan-edit-1",
      expect.objectContaining({
        codigo: "PREV-VEHI-90D",
        nombre: "Mantenimiento Trimestral Flota",
        criterioDefaultTipo: "TIEMPO",
        criterioDefaultDias: 90,
      }),
    )
    expect(toastSuccess).toHaveBeenCalled()
  })

  it("asigna orden único monotónico en Paso 2 tras desmarcar un ítem anterior, marcar otro y usar Marcar todas", async () => {
    const cuatroAplicaciones: ActividadAplicacion[] = [
      ...APLICACIONES_MOCK,
      {
        id: "app-3",
        actividadMantenimientoId: "act-m-3",
        actividad: {
          id: "act-m-3",
          codigo: "ACT-FILTRO",
          nombre: "Cambio de filtro de aire",
        },
        tipoActivo: { id: "tipo-veh-1", nombre: "Vehículo" },
      },
      {
        id: "app-4",
        actividadMantenimientoId: "act-m-4",
        actividad: {
          id: "act-m-4",
          codigo: "ACT-BUJIAS",
          nombre: "Revisión de bujías",
        },
        tipoActivo: { id: "tipo-veh-1", nombre: "Vehículo" },
      },
    ]
    vi.mocked(listActividadAplicaciones).mockResolvedValue(buildPage(cuatroAplicaciones))

    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<PlanPreventivoWizardPage />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(listTiposActivo).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole("combobox", { name: /tipo de activo/i }))
    await user.click(await screen.findByRole("option", { name: "Vehículo" }))
    await user.type(screen.getByLabelText(/nombre del plan/i), "Plan Orden Único")
    await user.type(screen.getByLabelText(/código único/i), "PREV-ORDEN-1")
    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))

    const cb1 = await screen.findByRole("checkbox", { name: /cambio de aceite de motor/i })
    const cb2 = screen.getByRole("checkbox", { name: /inspección de frenos/i })
    const cb3 = screen.getByRole("checkbox", { name: /cambio de filtro de aire/i })
    const cb4 = screen.getByRole("checkbox", { name: /revisión de bujías/i })

    await user.click(cb1) // #1
    await user.click(cb2) // #2
    await user.click(cb3) // #3
    await user.click(cb1) // desmarca #1
    await user.click(cb4) // debe recibir #4, no #3

    expect(screen.queryByText("#1")).not.toBeInTheDocument()
    expect(screen.getAllByText("#2")).toHaveLength(1)
    expect(screen.getAllByText("#3")).toHaveLength(1)
    expect(screen.getAllByText("#4")).toHaveLength(1)

    // Marcar todas debe conservar #2, #3, #4 y asignar #5 al ítem desmarcado
    await user.click(screen.getByRole("button", { name: /marcar todas/i }))
    expect(screen.getAllByText("#2")).toHaveLength(1)
    expect(screen.getAllByText("#3")).toHaveLength(1)
    expect(screen.getAllByText("#4")).toHaveLength(1)
    expect(screen.getAllByText("#5")).toHaveLength(1)

    await user.click(screen.getByRole("button", { name: /siguiente: elegir activos/i }))
    await user.click(await screen.findByRole("button", { name: /guardar y activar plan/i }))

    await waitFor(() => {
      expect(createPlanPreventivoCompleto).toHaveBeenCalledTimes(1)
    })

    const submitted = vi.mocked(createPlanPreventivoCompleto).mock.calls[0]?.[0]
    expect(submitted?.actividades).toEqual([
      { actividadMantenimientoAplicacionId: "app-2", orden: 2, obligatorio: true },
      { actividadMantenimientoAplicacionId: "app-3", orden: 3, obligatorio: true },
      { actividadMantenimientoAplicacionId: "app-4", orden: 4, obligatorio: true },
      { actividadMantenimientoAplicacionId: "app-1", orden: 5, obligatorio: true },
    ])
    const ordens = submitted?.actividades.map((a) => a.orden) ?? []
    expect(new Set(ordens).size).toBe(ordens.length)
  })

  it("muestra mensajes de validación en español (sin errores en inglés de Zod) cuando días o uso están vacíos, en cero o decimales", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<PlanPreventivoWizardPage />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(listTiposActivo).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole("combobox", { name: /tipo de activo/i }))
    await user.click(await screen.findByRole("option", { name: "Vehículo" }))
    await user.type(screen.getByLabelText(/nombre del plan/i), "Plan Validación")
    await user.type(screen.getByLabelText(/código único/i), "PREV-VAL-1")

    const diasInput = screen.getByLabelText(/o escribe los días exactos/i)
    await user.clear(diasInput)
    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))

    expect(
      await screen.findByText("Ingresa el intervalo en días para criterio por fecha"),
    ).toBeInTheDocument()
    for (const alert of screen.getAllByRole("alert")) {
      expect(alert.textContent).not.toMatch(/too small|invalid input|expected/i)
    }

    await user.type(diasInput, "12.5")
    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))
    expect(await screen.findByText("Debe ser un número entero")).toBeInTheDocument()
    for (const alert of screen.getAllByRole("alert")) {
      expect(alert.textContent).not.toMatch(/too small|invalid input|expected/i)
    }

    await user.clear(diasInput)
    await user.type(diasInput, "0")
    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))
    expect(await screen.findByText("Debe ser mayor a 0")).toBeInTheDocument()
    for (const alert of screen.getAllByRole("alert")) {
      expect(alert.textContent).not.toMatch(/too small|invalid input|expected/i)
    }

    // Cambiar a KILOMETRAJE y probar uso vacío y 0
    const radioGroup = screen.getByRole("radiogroup", { name: /criterio de control/i })
    await user.click(within(radioGroup).getByRole("radio", { name: /por kilometraje/i }))

    const usoInput = screen.getByLabelText(/o escribe el valor exacto/i)
    await user.clear(usoInput)
    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))
    expect(await screen.findByText("Ingresa el intervalo de uso (km u horas)")).toBeInTheDocument()

    await user.type(usoInput, "0")
    await user.click(screen.getByRole("button", { name: /siguiente: elegir actividades/i }))
    expect(await screen.findByText("Debe ser mayor a 0")).toBeInTheDocument()
    for (const alert of screen.getAllByRole("alert")) {
      expect(alert.textContent).not.toMatch(/too small|invalid input|expected/i)
    }
  })

  it("soporta tabIndex rotativo y navegación con flechas en el radiogroup de criterio de control", async () => {
    const user = userEvent.setup()
    const { Wrapper } = createWrapper()
    render(<PlanPreventivoWizardPage />, { wrapper: Wrapper })

    const radioGroup = screen.getByRole("radiogroup", { name: /criterio de control/i })
    const tiempoRadio = within(radioGroup).getByRole("radio", { name: /por fecha/i })
    const kmRadio = within(radioGroup).getByRole("radio", { name: /por kilometraje/i })
    const horasRadio = within(radioGroup).getByRole("radio", { name: /por horas de uso/i })

    expect(tiempoRadio).toHaveAttribute("tabindex", "0")
    expect(tiempoRadio).toHaveAttribute("aria-checked", "true")
    expect(kmRadio).toHaveAttribute("tabindex", "-1")
    expect(kmRadio).toHaveAttribute("aria-checked", "false")
    expect(horasRadio).toHaveAttribute("tabindex", "-1")
    expect(horasRadio).toHaveAttribute("aria-checked", "false")

    tiempoRadio.focus()
    expect(document.activeElement).toBe(tiempoRadio)

    await user.keyboard("{ArrowRight}")
    expect(kmRadio).toHaveAttribute("aria-checked", "true")
    expect(kmRadio).toHaveAttribute("tabindex", "0")
    expect(tiempoRadio).toHaveAttribute("tabindex", "-1")
    expect(document.activeElement).toBe(kmRadio)

    await user.keyboard("{ArrowDown}")
    expect(horasRadio).toHaveAttribute("aria-checked", "true")
    expect(horasRadio).toHaveAttribute("tabindex", "0")
    expect(kmRadio).toHaveAttribute("tabindex", "-1")
    expect(document.activeElement).toBe(horasRadio)

    // Wrap-around hacia adelante
    await user.keyboard("{ArrowRight}")
    expect(tiempoRadio).toHaveAttribute("aria-checked", "true")
    expect(tiempoRadio).toHaveAttribute("tabindex", "0")
    expect(document.activeElement).toBe(tiempoRadio)

    // Wrap-around hacia atrás
    await user.keyboard("{ArrowLeft}")
    expect(horasRadio).toHaveAttribute("aria-checked", "true")
    expect(horasRadio).toHaveAttribute("tabindex", "0")
    expect(document.activeElement).toBe(horasRadio)

    await user.keyboard("{ArrowUp}")
    expect(kmRadio).toHaveAttribute("aria-checked", "true")
    expect(kmRadio).toHaveAttribute("tabindex", "0")
    expect(document.activeElement).toBe(kmRadio)
  })
})
