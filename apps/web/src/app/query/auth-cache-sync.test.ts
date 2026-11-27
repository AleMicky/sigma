import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AuthUser } from "@/app/router/router.context"
import { useAuthStore } from "@/app/store/auth.store"
import { jwtForTests } from "@/test/jwt"

import { queryClient } from "./queryClient"

function userWithId(id: string, roles: string[] = ["ADMIN"]): AuthUser {
  return {
    id,
    username: id,
    name: id,
    email: `${id}@example.com`,
    roles,
  }
}

function signIn(user: AuthUser): void {
  act(() => {
    useAuthStore.getState().setSession({
      user,
      accessToken: jwtForTests(3600),
      refreshToken: null,
      expiresIn: 3600,
    })
  })
}

beforeEach(() => {
  act(() => useAuthStore.getState().clearSession())
  queryClient.clear()
})

afterEach(() => {
  act(() => useAuthStore.getState().clearSession())
  vi.restoreAllMocks()
})

describe("sincronización de caché con la sesión (REQ-SEG-112)", () => {
  it("clearSession vacía TanStack Query exactamente una vez", () => {
    signIn(userWithId("user-1"))
    queryClient.setQueryData(["caché", "privada"], { valor: 1 })
    const clearSpy = vi.spyOn(queryClient, "clear")

    act(() => useAuthStore.getState().clearSession())

    expect(clearSpy).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(["caché", "privada"])).toBeUndefined()
  })

  it("cambiar de user.id vacía la caché exactamente una vez", () => {
    signIn(userWithId("user-1"))
    queryClient.setQueryData(["caché", "privada"], { valor: 1 })
    const clearSpy = vi.spyOn(queryClient, "clear")

    signIn(userWithId("user-2"))

    expect(clearSpy).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(["caché", "privada"])).toBeUndefined()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it("un clearSession sin sesión activa también limpia una sola vez", () => {
    queryClient.setQueryData(["caché", "privada"], { valor: 1 })
    const clearSpy = vi.spyOn(queryClient, "clear")

    act(() => useAuthStore.getState().clearSession())

    expect(clearSpy).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(["caché", "privada"])).toBeUndefined()
  })

  it("un cambio solo de roles no vacía la caché", () => {
    signIn(userWithId("user-1", ["ADMIN"]))
    const clearSpy = vi.spyOn(queryClient, "clear")

    signIn(userWithId("user-1", ["SUPERVISOR"]))

    expect(clearSpy).not.toHaveBeenCalled()
  })
})
