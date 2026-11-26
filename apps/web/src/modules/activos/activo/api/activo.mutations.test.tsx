import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { toast } from "sonner"

import { activoKeys } from "./activo.keys"
import { useCreateActivo, useUpdateActivo } from "./activo.mutations"
import { createActivo, updateActivo } from "./activo.service"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("./activo.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./activo.service")>()
  return {
    ...actual,
    createActivo: vi.fn(),
    updateActivo: vi.fn(),
    deleteActivo: vi.fn(),
  }
})

const payload = {
  codigo: "ACT-1",
  nombre: "Transformador",
  tipoActivoId: "tipo-1",
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(queryClient, "invalidateQueries")

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return { Wrapper, queryClient, invalidate }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("mutaciones de activos", () => {
  it("la creación invalida activoKeys.all para refrescar listados y resumen", async () => {
    vi.mocked(createActivo).mockResolvedValue({ id: "activo-1" } as never)
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useCreateActivo(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(vi.mocked(createActivo).mock.calls[0][0]).toEqual(payload)
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: activoKeys.lists() }),
    )
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: activoKeys.all }),
    )
    expect(toast.success).toHaveBeenCalledWith("Activo creado correctamente")
  })

  it("la actualización invalida la raíz y el detalle del activo guardado", async () => {
    vi.mocked(updateActivo).mockResolvedValue({ id: "activo-1" } as never)
    const { Wrapper, invalidate } = createWrapper()
    const { result } = renderHook(() => useUpdateActivo(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: "activo-1", payload })
    })

    expect(vi.mocked(updateActivo).mock.calls[0][0]).toBe("activo-1")
    expect(vi.mocked(updateActivo).mock.calls[0][1]).toEqual(payload)
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: activoKeys.all }),
    )
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: activoKeys.detail("activo-1") }),
    )
    expect(toast.success).toHaveBeenCalledWith(
      "Activo actualizado correctamente",
    )
  })

  it("el reintento tras fallar la imagen actualiza el id creado en vez de crear otro", async () => {
    vi.mocked(createActivo).mockResolvedValue({ id: "activo-guardado" } as never)
    vi.mocked(updateActivo).mockResolvedValue({ id: "activo-guardado" } as never)
    const { Wrapper } = createWrapper()
    const create = renderHook(() => useCreateActivo(), { wrapper: Wrapper })
    const update = renderHook(() => useUpdateActivo(), { wrapper: Wrapper })

    let savedId: string | null = null
    await act(async () => {
      const created = await create.result.current.mutateAsync(payload)
      savedId = created.id
    })

    expect(savedId).toBe("activo-guardado")

    await act(async () => {
      if (savedId) {
        await update.result.current.mutateAsync({
          id: savedId,
          payload: { ...payload, nombre: "Transformador corregido" },
        })
      }
    })

    expect(createActivo).toHaveBeenCalledTimes(1)
    expect(updateActivo).toHaveBeenCalledTimes(1)
    expect(vi.mocked(updateActivo).mock.calls[0][0]).toBe("activo-guardado")
    expect(vi.mocked(updateActivo).mock.calls[0][1]).toEqual({
      ...payload,
      nombre: "Transformador corregido",
    })
  })
})
