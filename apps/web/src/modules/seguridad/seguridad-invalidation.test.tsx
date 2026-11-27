import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { authKeys } from "@/modules/auth/api/auth.keys"

import { menuKeys } from "./menu/api/menu.keys"
import { createMenu, deleteMenu } from "./menu/api/menu.service"
import { createPermiso } from "./permiso/api/permiso.service"
import { useCreatePermiso } from "./permiso/api/permiso.mutations"
import { useDeleteMenu } from "./menu/api/menu.mutations"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

vi.mock("./permiso/api/permiso.service", () => ({
  createPermiso: vi.fn(),
  updatePermiso: vi.fn(),
  deletePermiso: vi.fn(),
}))

vi.mock("./menu/api/menu.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./menu/api/menu.service")>()
  return { ...actual, createMenu: vi.fn(), deleteMenu: vi.fn() }
})

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

describe("invalidación de seguridad (REQ-SEG-104)", () => {
  it("crear un permiso invalida /auth/me y mis-menus", async () => {
    vi.mocked(createPermiso).mockResolvedValue({
      id: "permiso-1",
    } as Awaited<ReturnType<typeof createPermiso>>)
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useCreatePermiso(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync({} as Parameters<typeof createPermiso>[0])
    })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: authKeys.me() })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: menuKeys.misMenus(),
    })
  })

  it("eliminar un menú invalida /auth/me y mis-menus", async () => {
    vi.mocked(deleteMenu).mockResolvedValue(undefined)
    vi.mocked(createMenu).mockResolvedValue(
      {} as Awaited<ReturnType<typeof createMenu>>,
    )
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useDeleteMenu(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync("menu-1")
    })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: authKeys.me() })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: menuKeys.misMenus(),
    })
  })
})
