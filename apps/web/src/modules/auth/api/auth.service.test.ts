import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import { AxiosError } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { axiosInstance } from "@/shared/api"

import { authEndpoints } from "./auth.endpoints"
import { logout } from "./auth.service"

function okResponse(config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    data: undefined,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  }
}

let originalAdapter: typeof axiosInstance.defaults.adapter

beforeEach(() => {
  originalAdapter = axiosInstance.defaults.adapter
})

afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter
  vi.restoreAllMocks()
})

describe("auth.service.logout (REQ-SEG-105)", () => {
  it("envía Bearer junto al refreshToken cuando hay access token", async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      okResponse(config),
    )
    axiosInstance.defaults.adapter = adapter as AxiosAdapter

    await logout("refresh-1", "access-1")

    const config = adapter.mock.calls[0][0]
    expect(config.url).toBe(authEndpoints.logout)
    expect(config.method).toBe("post")
    expect(JSON.parse(String(config.data))).toEqual({ refreshToken: "refresh-1" })
    expect(config.headers.Authorization).toBe("Bearer access-1")
    expect(config.skipAuth).toBe(true)
  })

  it("omite el header cuando no hay access token", async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      okResponse(config),
    )
    axiosInstance.defaults.adapter = adapter as AxiosAdapter

    await logout("refresh-1", null)

    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined()
    expect(JSON.parse(String(adapter.mock.calls[0][0].data))).toEqual({
      refreshToken: "refresh-1",
    })
  })

  it("intenta el logout aunque no haya refreshToken (el API validará el body)", async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      okResponse(config),
    )
    axiosInstance.defaults.adapter = adapter as AxiosAdapter

    await logout(null, "access-1")

    expect(JSON.parse(String(adapter.mock.calls[0][0].data))).toEqual({
      refreshToken: "",
    })
    expect(adapter.mock.calls[0][0].headers.Authorization).toBe("Bearer access-1")
  })

  it("propaga el error 500 para que la mutación pueda avisar", async () => {
    axiosInstance.defaults.adapter = (async (
      config: InternalAxiosRequestConfig,
    ) => {
      const errorResponse: AxiosResponse = {
        data: { message: "Fallo Keycloak" },
        status: 500,
        statusText: "Error",
        headers: {},
        config,
      }
      throw new AxiosError(
        "Fallo Keycloak",
        "ERR_BAD_RESPONSE",
        config,
        undefined,
        errorResponse,
      )
    }) as AxiosAdapter

    await expect(logout("refresh-1", "access-1")).rejects.toMatchObject({
      status: 500,
      message: "Fallo Keycloak",
    })
  })
})
