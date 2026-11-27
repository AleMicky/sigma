import { QueryClient } from "@tanstack/react-query"
import { isRedirect } from "@tanstack/react-router"
import { act } from "@testing-library/react"
import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"
import { AxiosError } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { axiosInstance } from "@/shared/api"
import { authRedirectState } from "@/shared/api/auth-redirect-state"
import { navigateToExternalUrl } from "@/shared/api/navigation"
import type { AuthUser } from "@/app/router/router.context"
import { useAuthStore } from "@/app/store/auth.store"
import { jwtForTests } from "@/test/jwt"

import { Route } from "./_dashboard"

vi.mock("@/shared/api/navigation", () => ({
  navigateToExternalUrl: vi.fn(),
}))

type GuardArgs = Parameters<
  NonNullable<NonNullable<typeof Route.options.beforeLoad>>
>[0]

const user: AuthUser = {
  id: "user-1",
  username: "ana",
  name: "Ana Pérez",
  email: "ana@example.com",
  roles: ["ADMIN"],
}

function guardArgs(isAuthenticated: boolean): GuardArgs {
  return {
    context: {
      queryClient: new QueryClient(),
      auth: { user: isAuthenticated ? user : null, isAuthenticated },
    },
    location: {
      pathname: "/gestion-vehicular/solicitudes",
      searchStr: "?tab=nueva",
      href: "/gestion-vehicular/solicitudes?tab=nueva",
    },
  } as unknown as GuardArgs
}

async function runGuard(isAuthenticated: boolean): Promise<unknown> {
  try {
    await Route.options.beforeLoad?.(guardArgs(isAuthenticated))
    return undefined
  } catch (error) {
    return error
  }
}

function signIn(refreshToken: string | null = "refresh-1") {
  act(() =>
    useAuthStore.getState().setSession({
      user,
      accessToken: jwtForTests(3600),
      refreshToken,
      expiresIn: 3600,
    }),
  )
}

let originalAdapter: typeof axiosInstance.defaults.adapter

beforeEach(() => {
  originalAdapter = axiosInstance.defaults.adapter
  authRedirectState.isRedirecting = false
  authRedirectState.refreshPromise = null
  vi.mocked(navigateToExternalUrl).mockClear()
})

afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter
  vi.restoreAllMocks()
  act(() => useAuthStore.getState().clearSession())
})

describe("guard del dashboard (REQ-SEG-101 / REQ-SEG-104 / REQ-SEG-109)", () => {
  it("redirige a login cuando el contexto no está autenticado", async () => {
    const thrown = await runGuard(false)

    if (!isRedirect(thrown)) {
      throw new Error("El guard debió devolver un redirect")
    }
    expect(thrown.options).toMatchObject({ to: "/login" })
  })

  it("redirige y limpia una sesión expirada al hidratar", async () => {
    signIn()
    act(() =>
      useAuthStore.setState({
        expiresAt: Date.now() - 1000,
        accessToken: jwtForTests(-10),
      }),
    )

    const thrown = await runGuard(true)

    expect(isRedirect(thrown)).toBe(true)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it("401 en /auth/me cierra sesión y redirige a login", async () => {
    signIn(null)
    axiosInstance.defaults.adapter = (async (
      config: InternalAxiosRequestConfig,
    ) => {
      const errorResponse: AxiosResponse = {
        data: { message: "No autorizado" },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config,
      }
      throw new AxiosError(
        "No autorizado",
        "ERR_BAD_RESPONSE",
        config,
        undefined,
        errorResponse,
      )
    }) as AxiosAdapter

    const thrown = await runGuard(true)

    expect(isRedirect(thrown)).toBe(true)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(navigateToExternalUrl).toHaveBeenCalled()
  })

  it("con sesión válida consulta /auth/me y no reescribe el store", async () => {
    signIn()
    const urls: string[] = []
    axiosInstance.defaults.adapter = (async (
      config: InternalAxiosRequestConfig,
    ) => {
      urls.push(config.url ?? "")
      return {
        data: config.url === "/auth/me" ? user : [],
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }
    }) as AxiosAdapter

    expect(await runGuard(true)).toBeUndefined()
    expect(urls).toContain("/auth/me")
    expect(useAuthStore.getState().user).toEqual(user)
  })
})
