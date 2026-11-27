import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { ProgramacionMantenimiento } from "../api/programacion-mantenimiento.service"
import { ProgramacionMantenimientoListView } from "./ProgramacionMantenimientoListView"

vi.mock("../api/programacion-mantenimiento.mutations", () => ({
  useActivarProgramacion: () => ({ mutateAsync: vi.fn() }),
  useDesactivarProgramacion: () => ({ mutateAsync: vi.fn() }),
  useDeleteProgramacion: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock("./EvaluarProgramacionDialog", () => ({
  EvaluarProgramacionDialog: () => null,
}))
vi.mock("./CompletarMantenimientoDialog", () => ({
  CompletarMantenimientoDialog: () => null,
}))
vi.mock("./ProgramacionHistorialSheet", () => ({
  ProgramacionHistorialSheet: () => null,
}))

const programacion: ProgramacionMantenimiento = {
  id: "programacion-1",
  planMantenimientoActivoId: "plan-activo-1",
  activo: true,
  planActivo: {
    id: "plan-activo-1",
    planMantenimientoId: "plan-1",
    activoId: "activo-1",
    activoCodigo: "ACT-001",
    activoNombre: "Excavadora 01",
    planCodigo: "PLAN-01",
    planNombre: "Preventivo",
  },
  criterios: [
    {
      id: "criterio-1",
      programacionMantenimientoId: "programacion-1",
      tipoCriterio: "TIEMPO",
      intervaloDias: 90,
      proximaFecha: "2026-11-26",
      activo: true,
    },
  ],
}

function renderList(
  overrides: Partial<ComponentProps<typeof ProgramacionMantenimientoListView>> = {},
) {
  return render(
    <ProgramacionMantenimientoListView
      programaciones={[programacion]}
      isLoading={false}
      onEdit={vi.fn()}
      searchTerm=""
      onSearchChange={vi.fn()}
      filtroEstado="todos"
      onFiltroEstadoChange={vi.fn()}
      {...overrides}
    />,
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe("ProgramacionMantenimientoListView", () => {
  it("considera vencida hoy la fecha local cuando UTC ya cambió de día", () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))

    render(
      <ProgramacionMantenimientoListView
        programaciones={[programacion]}
        isLoading={false}
        onEdit={vi.fn()}
        searchTerm=""
        onSearchChange={vi.fn()}
        filtroEstado="todos"
        onFiltroEstadoChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/vence hoy/i)).toBeInTheDocument()
    expect(screen.queryByText(/vencido hace 1 día/i)).not.toBeInTheDocument()
  })

  it("muestra un banner role=alert con Reintentar y suprime el empty state en error 503", () => {
    const onRetry = vi.fn()
    renderList({
      programaciones: [],
      isError: true,
      errorMessage: "Servicio no disponible (503)",
      onRetry,
    })

    const banner = screen.getByRole("alert")
    expect(banner).toHaveTextContent(/No se pudieron cargar las programaciones/)
    expect(banner).toHaveTextContent(/503/)
    fireEvent.click(screen.getByRole("button", { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByText(/No se encontraron programaciones/),
    ).not.toBeInTheDocument()
  })

  it("marca aria-busy en carga y no muestra el estado vacío", () => {
    renderList({ programaciones: [], isLoading: true })

    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(
      screen.queryByText(/No se encontraron programaciones/),
    ).not.toBeInTheDocument()
  })

  it("conserva los datos previos durante isFetching y marca aria-busy", () => {
    renderList({ isFetching: true })

    expect(screen.getByText("ACT-001")).toBeInTheDocument()
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("muestra el estado vacío con role=alert solo sin error ni carga", () => {
    renderList({ programaciones: [] })

    expect(screen.getByRole("alert")).toHaveTextContent(
      /No se encontraron programaciones/,
    )
  })

  it("calcula 15 y 16 días naturales sin desplazamiento UTC", () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))

    const conFecha = (proximaFecha: string) => ({
      ...programacion,
      criterios: [{ ...programacion.criterios[0], proximaFecha }],
    })

    const { unmount } = renderList({
      programaciones: [conFecha("2026-12-11")],
    })
    expect(
      screen.getByText(/Faltan 15 días para la fecha objetivo/i),
    ).toBeInTheDocument()
    unmount()

    renderList({ programaciones: [conFecha("2026-12-12")] })
    expect(
      screen.getByText(/Faltan 16 días para la fecha objetivo/i),
    ).toBeInTheDocument()
  })
})
