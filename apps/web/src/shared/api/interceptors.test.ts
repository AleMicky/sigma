import type {
  AxiosAdapter,
  AxiosError as AxiosErrorType,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import { AxiosError } from "axios"
import { act, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { queryClient } from "@/app/query/queryClient"
import { apiConfig } from "@/app/config/api.config"
import type { AuthUser } from "@/app/router/router.context"
import { getSessionScope, useAuthStore } from "@/app/store/auth.store"
import { authEndpoints } from "@/modules/auth/api/auth.endpoints"
import { authKeys } from "@/modules/auth/api/auth.keys"
import { menuKeys } from "@/modules/seguridad/menu/api/menu.keys"

import { authRedirectState } from "./auth-redirect-state"
import { axiosInstance } from "./axios"
import { ApiError } from "./errors"
import { registerInterceptors } from "./interceptors"
import { navigateToExternalUrl } from "./navigation"

vi.mock("./navigation", () => ({
  navigateToExternalUrl: vi.fn(),
}))

const user: AuthUser = {
  id: "user-1",
  username: "ana",
  name: "Ana Pérez",
  email: "ana@example.com",
  roles: ["OPERARIO"],
}

function jwtWithExpiry(expSeconds: number): string {
  const payload = btoa(JSON.stringify({ exp: expSeconds }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
  return `header.${payload}.signature`
}

function response(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {},
    config,
  }
}

function httpError(
  status: number,
  config: InternalAxiosRequestConfig,
): AxiosErrorType {
  const errorResponse = response(
    config,
    { success: false, message: `Fallo ${status}`, status },
    status,
  )
  return new AxiosError(
    `HTTP ${status}`,
    "ERR_BAD_RESPONSE",
    config,
    undefined,
    errorResponse,
  )
}

function refreshPayload() {
  return {
    accessToken: jwtWithExpiry(Math.floor(Date.now() / 1000) + 3600),
    refreshToken: "refresh-nuevo",
    expiresIn: 3600,
    user,
  }
}

function signIn() {
  act(() =>
    useAuthStore.getState().setSession({
      user,
      accessToken: jwtWithExpiry(Math.floor(Date.now() / 1000) + 3600),
      refreshToken: "refresh-inicial",
      expiresIn: 3600,
    }),
  )
}

let adapter: ReturnType<typeof vi.fn> & AxiosAdapter
let originalAdapter: typeof axiosInstance.defaults.adapter
beforeEach(() => {
  originalAdapter = axiosInstance.defaults.adapter
  adapter = vi.fn() as unknown as ReturnType<typeof vi.fn> & AxiosAdapter
  axiosInstance.defaults.adapter = adapter
  registerInterceptors()
  queryClient.clear()
  signIn()
  authRedirectState.isRedirecting = false
  authRedirectState.refreshPromise = null
  authRedirectState.redirectPromise = null
  vi.mocked(navigateToExternalUrl).mockClear()
})

afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter
  vi.restoreAllMocks()
  queryClient.clear()
  act(() => useAuthStore.getState().clearSession())
  localStorage.clear()
})

describe("interceptors de autenticación (REQ-SEG-104 / REQ-SEG-109)", () => {
  it("401 sin _retry refresca una vez y reintenta con el nuevo Bearer", async () => {
    vi.mocked(adapter).mockImplementation(async (config) => {
      if (config.url === authEndpoints.refresh) {
        return response(config, refreshPayload())
      }
      if (config._retry) {
        return response(config, { ok: true })
      }
      return Promise.reject(httpError(401, config))
    })

    const result = await axiosInstance.get("/recurso-protegido")

    expect(result.data).toEqual({ ok: true })
    expect(vi.mocked(adapter).mock.calls.map(([config]) => config.url)).toEqual([
      "/recurso-protegido",
      authEndpoints.refresh,
      "/recurso-protegido",
    ])
    expect(
      vi.mocked(adapter).mock.calls[2][0].headers.Authorization,
    ).toBe(`Bearer ${useAuthStore.getState().accessToken}`)
    expect(navigateToExternalUrl).not.toHaveBeenCalled()
  })

  it("401 con _retry limpia sesión, caché y redirige sin refrescar", async () => {
    vi.mocked(adapter).mockImplementation(async (config) =>
      Promise.reject(httpError(401, config)),
    )
    const clearSpy = vi.spyOn(queryClient, "clear")

    await expect(
      axiosInstance.get("/recurso", { _retry: true }),
    ).rejects.toMatchObject({ status: 401 })

    expect(
      vi.mocked(adapter).mock.calls.map(([config]) => config.url),
    ).toEqual(["/recurso"])
    expect(clearSpy).toHaveBeenCalled()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(navigateToExternalUrl).toHaveBeenCalledWith(
      expect.stringContaining("/login"),
    )
  })

  it("refresh 401 ⇒ logout local y redirección, sin bucle de refresh", async () => {
    vi.mocked(adapter).mockImplementation(async (config) =>
      Promise.reject(httpError(401, config)),
    )

    await expect(axiosInstance.get("/recurso")).rejects.toMatchObject({
      status: 401,
    })

    expect(
      vi.mocked(adapter).mock.calls.filter(([config]) =>
        config.url?.includes(authEndpoints.refresh),
      ),
    ).toHaveLength(1)
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
    expect(navigateToExternalUrl).toHaveBeenCalledOnce()
  })

  it("refreshes concurrentes comparten una sola petición e invalidan me y misMenus", async () => {
    let releaseRefresh = (): void => undefined
    const gate = new Promise<void>((resolve) => {
      releaseRefresh = resolve
    })
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")

    vi.mocked(adapter).mockImplementation(async (config) => {
      if (config.url === authEndpoints.refresh) {
        await gate
        return response(config, refreshPayload())
      }
      if (config._retry) {
        return response(config, { ok: true })
      }
      return Promise.reject(httpError(401, config))
    })

    const first = axiosInstance.get("/recurso-1")
    const second = axiosInstance.get("/recurso-2")
    releaseRefresh()
    await Promise.all([first, second])

    expect(
      vi.mocked(adapter).mock.calls.filter(([config]) =>
        config.url?.includes(authEndpoints.refresh),
      ),
    ).toHaveLength(1)
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: authKeys.me(),
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: menuKeys.misMenus(),
    })
    expect(useAuthStore.getState().refreshToken).toBe("refresh-nuevo")
    expect(
      useAuthStore.getState().sessionScope,
    ).toBe(getSessionScope(apiConfig.baseUrl, user.id))
  })

  it("403 no cierra sesión ni redirige", async () => {
    vi.mocked(adapter).mockImplementation(async (config) =>
      Promise.reject(httpError(403, config)),
    )

    await expect(axiosInstance.get("/recurso")).rejects.toBeInstanceOf(ApiError)

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(navigateToExternalUrl).not.toHaveBeenCalled()
    expect(
      vi.mocked(adapter).mock.calls.map(([config]) => config.url),
    ).toEqual(["/recurso"])
  })

  it("dos 401 concurrentes limpian la sesión y comparten una sola redirección", async () => {
    let releaseRefresh = (): void => undefined
    const gate = new Promise<void>((resolve) => {
      releaseRefresh = resolve
    })
    vi.mocked(adapter).mockImplementation(async (config) => {
      if (config.url === authEndpoints.refresh) {
        await gate
        // Refresh incompleto: ambos 401 acaban en redirectToLogin().
        return response(config, {})
      }
      return Promise.reject(httpError(401, config))
    })
    const clearSpy = vi.spyOn(queryClient, "clear")

    const first = axiosInstance.get("/recurso-1")
    const second = axiosInstance.get("/recurso-2")
    releaseRefresh()
    await Promise.all([first, second].map((request) => request.catch(() => undefined)))

    await waitFor(() => {
      expect(authRedirectState.isRedirecting).toBe(false)
    })
    expect(navigateToExternalUrl).toHaveBeenCalledOnce()
    // Cada cierre local (uno por 401) limpia la caché, aunque se dedupe la navegación.
    expect(clearSpy).toHaveBeenCalledTimes(2)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it("si falla la navegación, un 401 posterior también limpia y reintenta", async () => {
    vi.mocked(navigateToExternalUrl).mockImplementationOnce(() => {
      throw new Error("Navegación bloqueada")
    })
    vi.mocked(adapter).mockImplementation(async (config) =>
      Promise.reject(httpError(401, config)),
    )
    const clearSpy = vi.spyOn(queryClient, "clear")

    await expect(
      axiosInstance.get("/recurso-1", { _retry: true }),
    ).rejects.toMatchObject({ status: 401 })
    await waitFor(() => {
      expect(authRedirectState.isRedirecting).toBe(false)
    })

    signIn()
    await expect(
      axiosInstance.get("/recurso-2", { _retry: true }),
    ).rejects.toMatchObject({ status: 401 })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(clearSpy).toHaveBeenCalled()
    expect(navigateToExternalUrl).toHaveBeenCalledTimes(2)
  })
})
