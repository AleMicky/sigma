import { describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api"

import { replaceActivoAtributos } from "./activo-atributo-valor.service"

describe("replaceActivoAtributos", () => {
  it("envía el conjunto completo al endpoint bulk del activo", async () => {
    const put = vi.spyOn(http, "put").mockResolvedValue(undefined)
    const payload = {
      valores: [{ atributoId: "atr-1", valor: "ABC-123" }],
    }

    await replaceActivoAtributos("activo-1", payload)

    expect(put).toHaveBeenCalledWith("/activos/activo-1/atributos", payload)
  })
})
