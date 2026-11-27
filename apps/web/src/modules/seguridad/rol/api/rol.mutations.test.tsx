import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { toast } from "sonner"

import { authKeys } from "@/modules/auth/api/auth.keys"
import { menuKeys } from "@/modules/seguridad/menu/api/menu.keys"
import { ApiError } from "@/shared/api"

import { useAsignarMenusRol, useSincronizarRoles } from "./rol.mutations"
import { asignarMenusRol, sincronizarRoles } from "./rol.service"
import { rolKeys } from "./rol.keys"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

vi.mock("./rol.service", () => ({
  sincronizarRoles: vi.fn(),
  asignarMenusRol: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, "invalidateQueries")

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return { Wrapper, invalidate }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("mutaciones de roles (REQ-SEG-104 / REQ-SEG-113)", () => {
  it("KEYCLOAK_SYNC_ERROR evita el mensaje de sincronización completada", async () => {
    vi.mocked(sincronizarRoles).mockRejectedValue(
      new ApiError({
        message: "Keycloak devolvió 502",
        status: 422,
        code: "KEYCLOAK_SYNC_ERROR",
      }),
    )
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useSincronizarRoles(), {
      wrapper: Wrapper,
    })

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toMatchObject({
        code: "KEYCLOAK_SYNC_ERROR",
      })
    })

    expect(toast.error).toHaveBeenCalledWith(
      "No se pudo sincronizar los roles con Keycloak: Keycloak devolvió 502",
    )
    expect(toast.success).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: rolKeys.all })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: authKeys.me() })
  })

  it("asignar menús invalida /auth/me y mis-menus", async () => {
    vi.mocked(asignarMenusRol).mockResolvedValue(["menu-1"])
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useAsignarMenusRol(), {
      wrapper: Wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({
        id: "rol-1",
        menuIds: ["menu-1"],
      })
    })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: authKeys.me() })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: menuKeys.misMenus(),
    })
    expect(toast.success).toHaveBeenCalledWith(
      "Menús y permisos del rol actualizados correctamente",
    )
  })
})
