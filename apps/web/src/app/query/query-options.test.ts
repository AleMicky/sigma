import { describe, expect, it } from "vitest"

import { ApiError } from "@/shared/api"

import { queryDefaultOptions } from "./query-options"

const retry = queryDefaultOptions.queries?.retry as (
  failureCount: number,
  error: unknown,
) => boolean

describe("queryDefaultOptions", () => {
  it("no reintenta errores 4xx de la API", () => {
    expect(retry(0, new ApiError({ message: "No autorizado", status: 401 }))).toBe(
      false,
    )
    expect(retry(0, new ApiError({ message: "Inválido", status: 422 }))).toBe(
      false,
    )
  })

  it("reintenta una vez errores 5xx y errores desconocidos", () => {
    const serverError = new ApiError({ message: "Falló", status: 500 })

    expect(retry(0, serverError)).toBe(true)
    expect(retry(1, serverError)).toBe(false)
    expect(retry(0, new Error("red"))).toBe(true)
    expect(retry(1, new Error("red"))).toBe(false)
  })

  it("desactiva reintentos en mutaciones", () => {
    expect(queryDefaultOptions.mutations?.retry).toBe(0)
    expect(queryDefaultOptions.queries?.refetchOnWindowFocus).toBe(false)
    expect(queryDefaultOptions.queries?.refetchOnReconnect).toBe(true)
  })
})
