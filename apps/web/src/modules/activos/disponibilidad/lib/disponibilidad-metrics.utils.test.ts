import { describe, expect, it } from "vitest"

import {
  EMPTY_ACTIVO_RESUMEN,
  type ActivoResumen,
} from "@/modules/activos/activo/api/activo.service"

import {
  buildDisponibilidadMetricCards,
  formatTasaDisponibilidad,
} from "./disponibilidad-metrics.utils"

const resumen: ActivoResumen = {
  total: 10,
  deBaja: 1,
  enMantenimiento: 2,
  operativos: 7,
  operativo: 4,
  reserva: 2,
  enViaje: 1,
  fueraServicio: 3,
  disponibles: 7,
  tasaDisponibilidad: 70,
}

describe("formatTasaDisponibilidad", () => {
  it("usa el porcentaje del servidor sin volver a multiplicarlo", () => {
    expect(formatTasaDisponibilidad(37.25)).toBe("37.3%")
    expect(formatTasaDisponibilidad(70)).toBe("70.0%")
    expect(formatTasaDisponibilidad(Number.NaN)).toBe("0.0%")
  })
})

describe("buildDisponibilidadMetricCards", () => {
  it("renderiza todas las tarjetas desde los agregados del servidor", () => {
    const cards = buildDisponibilidadMetricCards(resumen)
    const byId = new Map(cards.map((card) => [card.id, card]))

    expect(cards).toHaveLength(6)
    expect(byId.get("total")?.value).toBe("10")
    expect(byId.get("disponibilidad")?.value).toBe("70.0%")
    expect(byId.get("disponibilidad")?.detail).toContain("7 activos")
    expect(byId.get("operativos")?.value).toBe("7")
    expect(byId.get("operativos")?.detail).toContain("4 en estado operativo")
    expect(byId.get("mantenimiento")?.value).toBe("2")
    expect(byId.get("fueraServicio")?.value).toBe("3")
    expect(byId.get("reservaBaja")?.value).toBe("3")
    expect(byId.get("reservaBaja")?.detail).toContain("1 en viaje")
  })

  it("mantiene valores vacíos y tasa cero sin cálculos locales", () => {
    const cards = buildDisponibilidadMetricCards(EMPTY_ACTIVO_RESUMEN)

    expect(cards.every((card) => card.value !== "NaN%")).toBe(true)
    expect(cards.find((card) => card.id === "disponibilidad")?.value).toBe(
      "0.0%",
    )
  })
})
