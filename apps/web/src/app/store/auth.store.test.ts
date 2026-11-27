import { act } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { apiConfig } from "@/app/config/api.config"
import type { AuthUser } from "@/app/router/router.context"

import {
  getAuthSessionKey,
  getAuthStorageKey,
  getSessionScope,
  resolveExpiresAt,
  useAuthStore,
} from "./auth.store"

const user: AuthUser = {
  id: "user-1",
  username: "juan",
  name: "Juan Pérez",
  email: "juan@example.com",
  roles: ["OPERARIO"],
}

function jwtWithExpiry(expSeconds: number): string {
  const payload = btoa(JSON.stringify({ exp: expSeconds }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
  return `header.${payload}.signature`
}

function persistedSession(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    state: {
      user,
      accessToken: jwtWithExpiry(Math.floor(Date.now() / 1000) + 3600),
      refreshToken: "refresh-1",
      expiresAt: Date.now() + 3_600_000,
      sessionScope: getSessionScope(apiConfig.baseUrl, user.id),
      ...overrides,
    },
    version: 1,
  })
}

beforeEach(() => {
  act(() => useAuthStore.getState().clearSession())
  localStorage.clear()
})

describe("auth.store (REQ-SEG-101 / REQ-SEG-104)", () => {
  it("no persiste isAuthenticated como fuente de verdad", async () => {
    act(() =>
      useAuthStore.getState().setSession({
        user,
        accessToken: jwtWithExpiry(Math.floor(Date.now() / 1000) + 3600),
        refreshToken: "refresh-1",
        expiresIn: 3600,
      }),
    )

    const raw = localStorage.getItem(getAuthStorageKey())
    expect(raw).not.toBeNull()
    const stored: unknown = JSON.parse(raw ?? "{}")
    expect(stored).toMatchObject({
      version: 1,
      state: {
        user,
        accessToken: expect.any(String),
        refreshToken: "refresh-1",
        expiresAt: expect.any(Number),
        sessionScope: getSessionScope(apiConfig.baseUrl, user.id),
      },
    })
    expect(
      (stored as { state: Record<string, unknown> }).state.isAuthenticated,
    ).toBeUndefined()

    await act(async () => {
      await useAuthStore.persist.rehydrate()
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user).toEqual(user)
  })

  it("descarta una sesión persistida expirada", async () => {
    localStorage.setItem(
      getAuthStorageKey(),
      persistedSession({
        expiresAt: Date.now() - 1000,
        accessToken: jwtWithExpiry(Math.floor(Date.now() / 1000) - 10),
      }),
    )

    await act(async () => {
      await useAuthStore.persist.rehydrate()
    })

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it("descarta la sesión si cambió el servidor (baseUrl)", async () => {
    const otherBaseUrl = "http://servidor-distinto:8081"
    localStorage.setItem(
      getAuthStorageKey(otherBaseUrl),
      persistedSession({
        sessionScope: getSessionScope(otherBaseUrl, user.id),
      }),
    )
    localStorage.setItem(
      getAuthStorageKey(),
      persistedSession({ sessionScope: getSessionScope(otherBaseUrl, user.id) }),
    )

    await act(async () => {
      await useAuthStore.persist.rehydrate()
    })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it("valida exp del JWT aunque expiresIn sea favorable", () => {
    const expiredJwt = jwtWithExpiry(Math.floor(Date.now() / 1000) - 1)
    expect(resolveExpiresAt(expiredJwt, 3600)).toBeLessThan(Date.now())

    act(() =>
      useAuthStore.getState().setSession({
        user,
        accessToken: expiredJwt,
        expiresIn: 3600,
      }),
    )
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().validateSession()).toBe(false)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it("clearSession limpia tokens, bandera y claves de storage", () => {
    act(() =>
      useAuthStore.getState().setSession({
        user,
        accessToken: jwtWithExpiry(Math.floor(Date.now() / 1000) + 3600),
      }),
    )
    localStorage.setItem("authenticated_user", "sesion-antigua")

    act(() => useAuthStore.getState().clearSession())

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      sessionScope: null,
      isAuthenticated: false,
    })
    expect(localStorage.getItem("authenticated_user")).toBeNull()
  })

  it("la clave de sesión del router cambia cuando cambian los roles", () => {
    const before = getAuthSessionKey(true, user)
    const after = getAuthSessionKey(true, { ...user, roles: ["ADMIN"] })

    expect(after).not.toBe(before)
    expect(getAuthSessionKey(true, { ...user, roles: ["ADMIN"] })).toBe(after)
  })
})
