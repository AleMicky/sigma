import { describe, expect, it } from "vitest"

import { toLocalDateKey } from "./date"

describe("toLocalDateKey", () => {
  it("usa componentes locales, sin convertir a UTC", () => {
    // 20:30 del 26/11 en Bolivia corresponde al 27/11 en UTC.
    const date = new Date(2026, 10, 26, 20, 30, 0)

    expect(toLocalDateKey(date)).toBe("2026-11-26")
  })

  it("rellena con ceros mes y día", () => {
    expect(toLocalDateKey(new Date(2026, 0, 2, 12, 0, 0))).toBe("2026-01-02")
  })
})
