import { QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { toast } from "sonner"

import { ApiError } from "@/shared/api"
import { queryClient } from "@/app/query/queryClient"
import type { AuthUser } from "@/app/router/router.context"
import {
  getAuthStorageKey,
  useAuthStore,
} from "@/app/store/auth.store"

import { authKeys } from "./auth.keys"
import { useLogin, useLogout } from "./auth.mutations"
import { login, logout } from "./auth.service"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock("./auth.service", () => ({
  login: vi.fn(),
  logout: vi.fn(),
}))

const user: AuthUser = {
  id: "user-1",
  username: "ana",
  name: "Ana Pérez",
  email: "ana@example.com",
  roles: ["ADMIN"],
}

const session = {
  user,
  accessToken: "access-1",
  refreshToken: "refresh-1",
  expiresIn: 3600,
  tokenType: "Bearer",
}

function signIn() {
  act(() =>
    useAuthStore.getState().setSession({
      user,
      accessToken: "access-1",
      refreshToken: "refresh-1",
      expiresIn: 3600,
    }),
  )
}

function createWrapper() {
  // Se usa el mismo client global que en producción: la limpieza la hace la
  // suscripción REQ-112, no la mutación.
  const clearSpy = vi.spyOn(queryClient, "clear")

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return { Wrapper, queryClient, clearSpy }
}

beforeEach(() => {
  signIn()
})

afterEach(() => {
  vi.clearAllMocks()
  act(() => useAuthStore.getState().clearSession())
  localStorage.clear()
})

describe("mutaciones de autenticación (REQ-SEG-105 / REQ-SEG-109)", () => {
  it("login guarda la sesión con expiresIn y siembra /auth/me", async () => {
    vi.mocked(login).mockResolvedValue(session)
    // El login real empieza sin sesión: la suscripción limpia al autenticar.
    act(() => useAuthStore.getState().clearSession())
    const { Wrapper, queryClient, clearSpy } = createWrapper()
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        username: "ana",
        password: "secreto",
      })
    })

    expect(vi.mocked(login).mock.calls[0][0]).toEqual({
      username: "ana",
      password: "secreto",
    })
    expect(clearSpy).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(authKeys.me())).toEqual(user)
    expect(useAuthStore.getState()).toMatchObject({
      user,
      accessToken: "access-1",
      refreshToken: "refresh-1",
      expiresAt: expect.any(Number),
      isAuthenticated: true,
    })
  })

  it("logout envía refresh y access actuales y vacía caché y sesión", async () => {
    vi.mocked(logout).mockResolvedValue(undefined)
    const { Wrapper, clearSpy } = createWrapper()
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(vi.mocked(logout)).toHaveBeenCalledWith("refresh-1", "access-1")
    expect(clearSpy).toHaveBeenCalledOnce()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    const stored: unknown = JSON.parse(
      localStorage.getItem(getAuthStorageKey()) ?? "{}",
    )
    expect(stored).toMatchObject({
      state: { user: null, accessToken: null, refreshToken: null },
    })
    expect(toast.warning).not.toHaveBeenCalled()
  })

  it("logout sin refreshToken iguala llama al servicio y limpia la sesión", async () => {
    act(() =>
      useAuthStore.getState().setSession({
        user,
        accessToken: "access-1",
        refreshToken: null,
        expiresIn: 3600,
      }),
    )
    vi.mocked(logout).mockResolvedValue(undefined)
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(vi.mocked(logout)).toHaveBeenCalledWith(null, "access-1")
    expect(useAuthStore.getState().user).toBeNull()
  })

  it("un 500 muestra aviso no bloqueante y no impide el cierre local", async () => {
    vi.mocked(logout).mockRejectedValue(
      new ApiError({ message: "Fallo Keycloak", status: 500 }),
    )
    const { Wrapper, clearSpy } = createWrapper()
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper })

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toMatchObject({
        status: 500,
      })
    })

    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining("Fallo Keycloak"),
    )
    expect(clearSpy).toHaveBeenCalledOnce()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
