import { act, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { queryClient } from "@/app/query/queryClient"
import type { AuthContext } from "@/app/router/router.context"
import { useAuthStore } from "@/app/store/auth.store"
import { jwtForTests } from "@/test/jwt"

import { router } from "./router"
import { RouterApp } from "./RouterApp"

vi.mock("@/app/router/router", () => ({
  router: { invalidate: vi.fn() },
}))

vi.mock("@tanstack/react-router", () => ({
  RouterProvider: ({ context }: { context: { auth: AuthContext } }) => (
    <div data-testid="router-provider">
      {context.auth.user?.roles.join(",") ?? "sin-sesion"}
    </div>
  ),
}))

const user = {
  id: "user-1",
  username: "ana",
  name: "Ana Pérez",
  email: "ana@example.com",
  roles: ["OPERARIO"],
}

beforeEach(async () => {
  act(() => useAuthStore.getState().clearSession())
  localStorage.clear()
  await act(async () => {
    await useAuthStore.persist.rehydrate()
  })
  vi.mocked(router.invalidate).mockClear()
})

afterEach(() => {
  act(() => useAuthStore.getState().clearSession())
})

describe("RouterApp (REQ-SEG-104)", () => {
  it("invalida el router cuando cambian los roles de la sesión", async () => {
    act(() =>
      useAuthStore.getState().setSession({
        user,
        accessToken: jwtForTests(3600),
        refreshToken: null,
        expiresIn: 3600,
      }),
    )

    render(<RouterApp />)
    expect(screen.getByTestId("router-provider")).toHaveTextContent("OPERARIO")
    expect(router.invalidate).not.toHaveBeenCalled()

    act(() =>
      useAuthStore.setState({
        user: { ...user, roles: ["ADMIN"] },
      }),
    )

    await waitFor(() => {
      expect(router.invalidate).toHaveBeenCalledOnce()
    })
    expect(screen.getByTestId("router-provider")).toHaveTextContent("ADMIN")
  })

  it("al cerrar sesión delega la limpieza total de caché en la suscripción", async () => {
    act(() =>
      useAuthStore.getState().setSession({
        user,
        accessToken: jwtForTests(3600),
        refreshToken: null,
        expiresIn: 3600,
      }),
    )
    const clearSpy = vi.spyOn(queryClient, "clear")

    render(<RouterApp />)
    act(() => useAuthStore.getState().clearSession())

    await waitFor(() => {
      expect(clearSpy).toHaveBeenCalledOnce()
    })

    clearSpy.mockRestore()
  })
})
