import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type ActivoListFilters = PageParams & {
  tipoActivoId?: string
  ubicacionId?: string
  q?: string
  activo?: boolean
}

export type ActivoResumenFilters = Pick<
  ActivoListFilters,
  "q" | "tipoActivoId" | "ubicacionId"
>

const baseKeys = createResourceKeys<"activos", ActivoListFilters>("activos")

export const activoKeys = {
  ...baseKeys,
  resumen: (filters?: ActivoResumenFilters) =>
    [...baseKeys.all, "resumen", filters] as const,
}
