import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ProgramacionMantenimientoFormDialog } from "./ProgramacionMantenimientoFormDialog"

const { createProgramacion, updateProgramacion, crearPorTipoActivo } = vi.hoisted(
  () => ({
    createProgramacion: vi.fn(),
    updateProgramacion: vi.fn(),
    crearPorTipoActivo: vi.fn(),
  }),
)

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: () => ({ data: { content: [] }, isLoading: false }),
  }
})

vi.mock("../api/programacion-mantenimiento.mutations", () => ({
  useCreateProgramacion: () => ({ mutateAsync: createProgramacion, isPending: false }),
  useUpdateProgramacion: () => ({ mutateAsync: updateProgramacion, isPending: false }),
  useCrearPorTipoActivo: () => ({ mutateAsync: crearPorTipoActivo, isPending: false }),
}))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe("ProgramacionMantenimientoFormDialog", () => {
  it("calcula proximaFecha en local y envía el payload de criterios sin desplazamiento UTC", async () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    // 23:30 local del 26/11; en UTC ya es 27/11.
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))
    createProgramacion.mockResolvedValue({ id: "programacion-1" })

    render(
      <ProgramacionMantenimientoFormDialog
        open
        onOpenChange={vi.fn()}
        planMantenimientoActivoId="plan-activo-1"
        activoId="activo-1"
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /por calendario/i }))

    // El contenido del diálogo se renderiza en un portal fuera del contenedor.
    const fechaBaseInput = document.querySelector<HTMLInputElement>(
      'input[type="date"]',
    )
    expect(fechaBaseInput).toHaveValue("2026-11-26")

    fireEvent.change(screen.getByPlaceholderText("Ej. 90"), {
      target: { value: "90" },
    })
    fireEvent.click(screen.getByRole("button", { name: /guardar programación/i }))

    await waitFor(() => expect(createProgramacion).toHaveBeenCalledTimes(1))
    expect(createProgramacion).toHaveBeenCalledWith(
      expect.objectContaining({
        activoId: "activo-1",
        criterios: [
          {
            id: undefined,
            tipoCriterio: "TIEMPO",
            intervaloDias: 90,
            proximaFecha: "2027-02-24",
            activo: true,
          },
        ],
      }),
    )
    expect(updateProgramacion).not.toHaveBeenCalled()
    expect(crearPorTipoActivo).not.toHaveBeenCalled()
  })

  it("muestra el error de validación con role=alert y no persiste un intervalo inválido", () => {
    render(
      <ProgramacionMantenimientoFormDialog
        open
        onOpenChange={vi.fn()}
        planMantenimientoActivoId="plan-activo-1"
        activoId="activo-1"
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /por calendario/i }))
    fireEvent.change(screen.getByPlaceholderText("Ej. 90"), {
      target: { value: "0" },
    })
    fireEvent.click(screen.getByRole("button", { name: /guardar programación/i }))

    expect(screen.getByRole("alert")).toHaveTextContent(
      /El intervalo en días debe ser mayor a 0/i,
    )
    expect(createProgramacion).not.toHaveBeenCalled()
  })
})
