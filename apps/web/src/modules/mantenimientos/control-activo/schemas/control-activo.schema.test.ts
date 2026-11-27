import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe("defaultControlActivoValues", () => {
  it("inicializa la fecha en hora local aunque en UTC ya sea el día siguiente", async () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))
    vi.resetModules()

    const { defaultControlActivoValues } = await import(
      "./control-activo.schema"
    )

    expect(defaultControlActivoValues.fecha).toBe("2026-11-26T23:30")
  })

  it("rechaza fecha vacía, cantidades negativas y observaciones fuera de longitud", async () => {
    const { controlActivoFormSchema } = await import("./control-activo.schema")

    const base = {
      solicitudMantenimientoId: "00000000-0000-4000-8000-000000000001",
      activoId: "00000000-0000-4000-8000-000000000002",
      tipo: "ENTREGA" as const,
      fecha: "2026-11-26T23:30",
      conforme: true,
      detalles: [],
    }

    expect(
      controlActivoFormSchema.safeParse({ ...base, fecha: "" }).success,
    ).toBe(false)

    const detalle = {
      accesorioId: "00000000-0000-4000-8000-000000000003",
      cantidadEsperada: -1,
      cantidadEncontrada: 0,
      conforme: true,
    }
    const conDetalleInvalido = controlActivoFormSchema.safeParse({
      ...base,
      detalles: [detalle],
    })
    expect(conDetalleInvalido.success).toBe(false)
    if (!conDetalleInvalido.success) {
      expect(
        conDetalleInvalido.error.issues.some((issue) =>
          issue.path.includes("cantidadEsperada"),
        ),
      ).toBe(true)
    }

    expect(
      controlActivoFormSchema.safeParse({ ...base, observacion: "x".repeat(501) })
        .success,
    ).toBe(false)
  })
})
