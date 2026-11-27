import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { toast } from "sonner"

import { authKeys } from "@/modules/auth/api/auth.keys"
import { menuKeys } from "@/modules/seguridad/menu/api/menu.keys"
import { ApiError } from "@/shared/api"

import { useSincronizarUsuarios } from "./usuario.mutations"
import { sincronizarUsuarios } from "./usuario.service"
import { usuarioKeys } from "./usuario.keys"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

vi.mock("./usuario.service", () => ({
  sincronizarUsuarios: vi.fn(),
  actualizarPersonaUsuario: vi.fn(),
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

describe("sincronización de usuarios (REQ-SEG-113)", () => {
  it("KEYCLOAK_SYNC_ERROR muestra un aviso honesto y no invalida como éxito", async () => {
    vi.mocked(sincronizarUsuarios).mockRejectedValue(
      new ApiError({
        message: "No se pudo conectar con Keycloak",
        status: 422,
        code: "KEYCLOAK_SYNC_ERROR",
      }),
    )
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useSincronizarUsuarios(), {
      wrapper: Wrapper,
    })

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toMatchObject({
        code: "KEYCLOAK_SYNC_ERROR",
      })
    })

    expect(toast.error).toHaveBeenCalledWith(
      "No se pudo sincronizar los usuarios con Keycloak: No se pudo conectar con Keycloak",
    )
    expect(toast.success).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: usuarioKeys.all,
    })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: authKeys.me() })
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: menuKeys.misMenus(),
    })
  })

  it("una sincronización correcta invalida identidad y menús", async () => {
    vi.mocked(sincronizarUsuarios).mockResolvedValue(2)
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useSincronizarUsuarios(), {
      wrapper: Wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: authKeys.me() })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: menuKeys.misMenus(),
    })
    expect(toast.success).toHaveBeenCalledWith(
      "Sincronización completada: 2 usuarios procesados",
    )
  })
})
