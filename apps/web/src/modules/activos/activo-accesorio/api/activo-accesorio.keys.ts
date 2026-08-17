import { createResourceKeys } from "@/shared/api"

const baseKeys = createResourceKeys("activo-accesorios")

export const activoAccesorioKeys = {
  ...baseKeys,
  byActivo: (activoId: string, params?: unknown) =>
    [...baseKeys.all, "by-activo", activoId, params] as const,
  byAccesorio: (accesorioId: string, params?: unknown) =>
    [...baseKeys.all, "by-accesorio", accesorioId, params] as const,
}
