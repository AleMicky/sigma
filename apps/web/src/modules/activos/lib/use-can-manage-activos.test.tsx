import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { useAuthStore } from "@/app/store/auth.store"

import { useCanManageActivos } from "./use-can-manage-activos"

afterEach(() => {
  act(() => useAuthStore.getState().clearSession())
})

function setUserWithRoles(roles: string[]) {
  act(() => {
    useAuthStore.getState().setSession({
      user: {
        id: "1",
        username: "usuario",
        name: "Usuario",
        email: "usuario@example.com",
        roles,
      },
      accessToken: "token",
    })
  })
}

describe("useCanManageActivos", () => {
  it("permite gestionar con ADMIN o ROLE_ADMIN", () => {
    setUserWithRoles(["ADMIN"])
    expect(renderHook(() => useCanManageActivos()).result.current).toBe(true)

    setUserWithRoles(["OPERARIO", "role_admin"])
    expect(renderHook(() => useCanManageActivos()).result.current).toBe(true)
  })

  it("niega la gestión a usuarios sin rol ADMIN", () => {
    setUserWithRoles(["OPERARIO"])
    expect(renderHook(() => useCanManageActivos()).result.current).toBe(false)

    setUserWithRoles([])
    expect(renderHook(() => useCanManageActivos()).result.current).toBe(false)
  })
})
