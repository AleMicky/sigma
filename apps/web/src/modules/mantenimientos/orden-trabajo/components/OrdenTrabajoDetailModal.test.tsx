import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { OrdenTrabajo } from "../api/orden-trabajo.service"
import { OrdenTrabajoDetailModal } from "./OrdenTrabajoDetailModal"

const { toggleActividad, actividad, downloadPdf } = vi.hoisted(() => ({
  toggleActividad: vi.fn(),
  actividad: {
    id: "actividad-ot-1",
    descripcion: "Revisar frenos",
    realizado: false,
    observacion: null,
  },
  downloadPdf: vi.fn(),
}))

vi.mock("../api/orden-trabajo.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/orden-trabajo.service")>()
  return { ...actual, downloadOrdenTrabajoReportePdf: downloadPdf }
})

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    Link: ({ children }: { children: ReactNode }) => children,
  }
})

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: (options: { queryKey?: readonly unknown[] }) => {
      const key = options.queryKey ?? []
      if (
        key.includes("ordenes-trabajo-actividades") &&
        key.includes("by-ot")
      ) {
        return { data: { content: [actividad] }, isLoading: false }
      }
      return { data: undefined, isLoading: false }
    },
  }
})

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

vi.mock("../api/orden-trabajo.mutations", () => ({
  useToggleOrdenTrabajoActividadRealizado: () => ({ mutate: toggleActividad }),
  useDeleteOrdenTrabajoActividad: () => ({ mutate: vi.fn() }),
  useDeleteOrdenTrabajoActividadEvidencia: () => ({ mutate: vi.fn() }),
  useDeleteOrdenTrabajoAdjunto: () => ({ mutate: vi.fn() }),
}))

vi.mock("./OrdenTrabajoActividadDialog", () => ({
  OrdenTrabajoActividadDialog: () => null,
}))
vi.mock("./OrdenTrabajoAdjuntoDialog", () => ({
  OrdenTrabajoAdjuntoDialog: () => null,
}))
vi.mock("./OrdenTrabajoEvidenciaDialog", () => ({
  OrdenTrabajoEvidenciaDialog: () => null,
}))
vi.mock("./OrdenTrabajoFormDialog", () => ({
  OrdenTrabajoFormDialog: () => null,
}))

const ordenTrabajo = {
  id: "ot-1",
  numero: "OT-0001",
  solicitudMantenimientoId: "solicitud-1",
} as OrdenTrabajo

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe("OrdenTrabajoDetailModal", () => {
  it("registra fechaRealizacion local al marcar una actividad como realizada", () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    // 23:30 local del 26/11; UTC ya es 27/11.
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))

    render(
      <OrdenTrabajoDetailModal
        open
        ordenTrabajo={ordenTrabajo}
        onOpenChange={vi.fn()}
      />,
    )

    const checkbox = document.querySelector<HTMLInputElement>(
      'input[title="Marcar como realizada"]',
    )
    if (!checkbox) throw new Error("No se encontró la actividad pendiente")
    fireEvent.click(checkbox)

    expect(toggleActividad).toHaveBeenCalledTimes(1)
    expect(toggleActividad).toHaveBeenCalledWith({
      id: actividad.id,
      payload: {
        ordenTrabajoId: ordenTrabajo.id,
        actividadMantenimientoId: null,
        descripcion: actividad.descripcion,
        realizado: true,
        observacion: null,
        fechaRealizacion: "2026-11-26T23:30:00",
      },
    })
  })

  it("delega la descarga del PDF al servicio con el id y número de la orden", async () => {
    downloadPdf.mockResolvedValue(undefined)

    render(
      <OrdenTrabajoDetailModal
        open
        ordenTrabajo={ordenTrabajo}
        onOpenChange={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTitle("Descargar Orden de Trabajo en PDF"))

    await waitFor(() =>
      expect(downloadPdf).toHaveBeenCalledWith("ot-1", "OT-0001"),
    )
  })
})
