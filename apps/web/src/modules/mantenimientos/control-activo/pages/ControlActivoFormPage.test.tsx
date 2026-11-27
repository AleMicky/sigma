import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ControlActivoFormPage } from "./ControlActivoFormPage"

const { createWithDetalles, updateWithDetalles, navigate, toastError, SOLICITUD_ID, ACTIVO_ID } =
  vi.hoisted(() => ({
    createWithDetalles: vi.fn(),
    updateWithDetalles: vi.fn(),
    navigate: vi.fn(),
    toastError: vi.fn(),
    SOLICITUD_ID: "00000000-0000-4000-8000-000000000001",
    ACTIVO_ID: "00000000-0000-4000-8000-000000000002",
  }))

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    useNavigate: () => navigate,
    useSearch: () => ({}),
  }
})

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: () => ({
      data: { activo: { id: ACTIVO_ID }, estado: "ASIGNADO", content: [] },
      isLoading: false,
    }),
  }
})

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: toastError },
}))

vi.mock("@/modules/organizacion/empleado/components/EmpleadoCombobox", () => ({
  EmpleadoCombobox: () => null,
}))

vi.mock("../components/ControlActivoHistorialModal", () => ({
  ControlActivoHistorialModal: () => null,
}))

vi.mock("../components/AccesorioSelectDialog", () => ({
  AccesorioSelectDialog: () => null,
}))

vi.mock("../api/control-activo.mutations", () => ({
  useCreateControlActivoWithDetalles: () => ({
    mutateAsync: createWithDetalles,
    isPending: false,
  }),
  useUpdateControlActivoWithDetalles: () => ({
    mutateAsync: updateWithDetalles,
    isPending: false,
  }),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe("ControlActivoFormPage", () => {
  it("envía fecha y hora locales en el payload de registro del acta", async () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    // 23:30 local del 26/11; UTC ya marca 27/11.
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))
    createWithDetalles.mockResolvedValue({ id: "control-1" })

    render(<ControlActivoFormPage solicitudId={SOLICITUD_ID} />)

    expect(screen.getByLabelText(/fecha \/ hora/i)).toHaveValue(
      "2026-11-26T23:30",
    )

    fireEvent.change(screen.getByLabelText(/fecha \/ hora/i), {
      target: { value: "2026-11-26T08:30" },
    })
    fireEvent.click(screen.getByRole("button", { name: /guardar acta/i }))

    await waitFor(() => expect(createWithDetalles).toHaveBeenCalledTimes(1))
    expect(createWithDetalles).toHaveBeenCalledWith(
      expect.objectContaining({
        control: expect.objectContaining({
          solicitudMantenimientoId: SOLICITUD_ID,
          activoId: ACTIVO_ID,
          fecha: "2026-11-26T08:30:00",
        }),
      }),
    )
    expect(updateWithDetalles).not.toHaveBeenCalled()
  })

  it("bloquea el guardado y notifica el error cuando falta la solicitud", () => {
    render(<ControlActivoFormPage solicitudId="" />)

    fireEvent.click(screen.getByRole("button", { name: /guardar acta/i }))

    expect(toastError).toHaveBeenCalledWith(
      "Debe especificar una solicitud de mantenimiento válida",
    )
    expect(createWithDetalles).not.toHaveBeenCalled()
    expect(updateWithDetalles).not.toHaveBeenCalled()
  })

  it("muestra el error inline de safeParse y bloquea el guardado", async () => {
    render(<ControlActivoFormPage solicitudId={SOLICITUD_ID} />)

    const fechaInput = screen.getByLabelText(/fecha \/ hora/i)
    fireEvent.change(fechaInput, { target: { value: "" } })
    // El campo tiene `required`: se dispara submit directamente para ejercitar
    // la validación de safeParse sin que la validación nativa lo bloquee.
    fireEvent.submit(fechaInput.closest("form") as HTMLFormElement)

    expect(await screen.findByText("La fecha es obligatoria")).toBeInTheDocument()
    expect(fechaInput).toHaveAttribute("aria-invalid", "true")
    expect(createWithDetalles).not.toHaveBeenCalled()
    expect(updateWithDetalles).not.toHaveBeenCalled()
  })
})
