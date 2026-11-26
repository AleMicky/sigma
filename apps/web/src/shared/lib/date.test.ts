import { describe, expect, it, vi } from "vitest"

import { toLocalDateKey, toLocalDateTimeIso } from "./date"

describe("toLocalDateKey", () => {
  it("usa componentes locales, sin convertir a UTC", () => {
    // 20:30 del 26/11 en Bolivia corresponde al 27/11 en UTC.
    const date = new Date(2026, 10, 26, 20, 30, 0)

    expect(toLocalDateKey(date)).toBe("2026-11-26")
  })

  it("rellena con ceros mes y día", () => {
    expect(toLocalDateKey(new Date(2026, 0, 2, 12, 0, 0))).toBe("2026-01-02")
  })

  it("no cambia de día a las 19:59 ni a las 20:01 en America/La_Paz", () => {
    try {
      vi.stubEnv("TZ", "America/La_Paz")

      // 19:59 y 20:01 locales son 23:59 y 00:01 del día siguiente en UTC.
      expect(toLocalDateKey(new Date("2026-11-26T23:59:00Z"))).toBe("2026-11-26")
      expect(toLocalDateKey(new Date("2026-11-27T00:01:00Z"))).toBe("2026-11-26")
    } finally {
      vi.unstubAllEnvs()
    }
  })
})

describe("toLocalDateTimeIso", () => {
  it("convierte datetime-local a yyyy-MM-ddTHH:mm:ss", () => {
    expect(toLocalDateTimeIso("2026-11-26T08:30")).toBe("2026-11-26T08:30:00")
    expect(toLocalDateTimeIso(" 2026-11-26T08:30:15.123 ")).toBe(
      "2026-11-26T08:30:15"
    )
  })

  it("convierte Z y offset a la hora local de America/La_Paz", () => {
    try {
      vi.stubEnv("TZ", "America/La_Paz")

      expect(toLocalDateTimeIso("2026-11-27T00:01:30Z")).toBe(
        "2026-11-26T20:01:30"
      )
      expect(toLocalDateTimeIso("2026-11-26T20:01:30-04:00")).toBe(
        "2026-11-26T20:01:30"
      )
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it("devuelve el valor original si no es una fecha válida", () => {
    expect(toLocalDateTimeIso("  no-fecha  ")).toBe("no-fecha")
  })
})
