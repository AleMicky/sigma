import { QueryClient } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  isRedirect,
} from "@tanstack/react-router"
import { act } from "@testing-library/react"
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { axiosInstance } from "@/shared/api"
import type { AuthUser } from "@/app/router/router.context"
import { routeTree } from "@/app/router/routeTree.gen"
import { useAuthStore } from "@/app/store/auth.store"
import { jwtForTests } from "@/test/jwt"

import { Route } from "./route"

type GuardArgs = Parameters<
  NonNullable<NonNullable<typeof Route.options.beforeLoad>>
>[0]

const operator: AuthUser = {
  id: "user-1",
  username: "operario",
  name: "Operario",
  email: "operario@example.com",
  roles: ["OPERARIO"],
}

const admin: AuthUser = { ...operator, roles: ["ADMIN"] }

function guardArgs(user: AuthUser | null): GuardArgs {
  return {
    context: {
      queryClient: new QueryClient(),
      auth: { user, isAuthenticated: user !== null },
    },
    location: {
      pathname: "/seguridad/usuarios",
      searchStr: "",
      href: "/seguridad/usuarios",
    },
  } as unknown as GuardArgs
}

function runGuard(user: AuthUser | null): unknown {
  try {
    Route.options.beforeLoad?.(guardArgs(user))
    return undefined
  } catch (error) {
    return error
  }
}

function signInAs(currentUser: AuthUser) {
  act(() =>
    useAuthStore.getState().setSession({
      user: currentUser,
      accessToken: jwtForTests(3600),
      refreshToken: null,
      expiresIn: 3600,
    }),
  )
}

beforeEach(() => {
  signInAs(operator)
})

afterEach(() => {
  act(() => useAuthStore.getState().clearSession())
})

describe("guard de /seguridad (REQ-SEG-103)", () => {
  it("deniega a un no-admin aunque tenga menús asignados", () => {
    const thrown = runGuard(operator)

    if (!isRedirect(thrown)) {
      throw new Error("El guard debió devolver un redirect")
    }
    expect(thrown.status).toBe(307)
    expect(thrown.options).toMatchObject({ to: "/", replace: true })
  })

  it("permite a un admin por rol, sin depender de menús", () => {
    signInAs(admin)
    expect(runGuard(admin)).toBeUndefined()
  })

  it("navegación directa a /seguridad/usuarios con no-admin redirige sin montar Outlet", async () => {
    const originalAdapter = axiosInstance.defaults.adapter
    axiosInstance.defaults.adapter = (async (
      config: InternalAxiosRequestConfig,
    ): Promise<AxiosResponse> => ({
      data: config.url === "/auth/me" ? operator : [],
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    })) as AxiosAdapter

    try {
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({
          initialEntries: ["/seguridad/usuarios"],
        }),
        context: {
          queryClient: new QueryClient(),
          auth: { user: operator, isAuthenticated: true },
        },
      })

      await router.load()

      expect(router.state.location.pathname).toBe("/")
      expect(router.state.matches.some((match) =>
        match.routeId.includes("seguridad"),
      )).toBe(false)
    } finally {
      axiosInstance.defaults.adapter = originalAdapter
    }
  })
})
