import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type {
  EvaluacionProgramacionResponse,
  ProgramacionMantenimiento,
} from "../api/programacion-mantenimiento.service"
import { EvaluarProgramacionDialog } from "./EvaluarProgramacionDialog"

const { mutateAsync } = vi.hoisted(() => ({ mutateAsync: vi.fn() }))

vi.mock("../api/programacion-mantenimiento.mutations", () => ({
  useEvaluarProgramacion: () => ({ mutateAsync, isPending: false }),
}))

const programacion: ProgramacionMantenimiento = {
  id: "4c0e4c42-45a4-4e2c-8b10-0c8aeb5f0a11",
  planMantenimientoActivoId: "8e6c1a1b-8b9d-4a4c-9b18-5f3d7f0b2c31",
  activo: true,
  criterios: [],
}

const respuestaEvaluacion: EvaluacionProgramacionResponse = {
  programacionId: programacion.id,
  cumpleCriterio: false,
  criterioCumplido: null,
  motivoDisparo: null,
  solicitudGenerada: false,
  yaExistiaSolicitudAbierta: false,
  solicitudMantenimientoId: null,
  solicitudNumero: null,
  mensaje: "Sin disparo",
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe("EvaluarProgramacionDialog", () => {
  it("envía la fecha local del navegador aunque en UTC ya sea el día siguiente", async () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    // 23:30 del 26/11 en La Paz = 03:30 del 27/11 en UTC.
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))
    mutateAsync.mockResolvedValue(respuestaEvaluacion)

    render(
      <EvaluarProgramacionDialog
        open
        onOpenChange={vi.fn()}
        programacion={programacion}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /ejecutar evaluación/i }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
    expect(mutateAsync).toHaveBeenCalledWith({
      id: programacion.id,
      payload: {
        fechaActual: "2026-11-26",
        kilometrajeActual: undefined,
        horasUsoActual: undefined,
        forzarGeneracion: false,
      },
    })
    expect(screen.getByLabelText(/fecha de evaluación/i)).toHaveValue(
      "2026-11-26",
    )
  })

  it("muestra un error recuperable con role=alert cuando la API rechaza la evaluación", async () => {
    mutateAsync.mockRejectedValue(
      new Error("APROBADOR_REQUERIDO: Se requiere aprobador"),
    )

    render(
      <EvaluarProgramacionDialog
        open
        onOpenChange={vi.fn()}
        programacion={programacion}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /ejecutar evaluación/i }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/APROBADOR_REQUERIDO/i),
    )
    expect(screen.getByRole("alert")).toHaveTextContent(/intentar nuevamente/i)
  })
})
