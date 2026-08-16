import { createResourceKeys } from "@/shared/api"

const baseKeys = createResourceKeys("activo-asignaciones")

export const activoAsignacionKeys = {
  ...baseKeys,
  byActivo: (activoId: string, params?: unknown) =>
    [...baseKeys.all, "by-activo", activoId, params] as const,
}
