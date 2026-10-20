import { createResourceKeys } from "@/shared/api"
import type { PageParams } from "@/shared/types/api.types"

export type PlanMantenimientoFilters = PageParams & {
  tipoActivoId?: string
}

export const planMantenimientoKeys = createResourceKeys<"planes-mantenimiento", PlanMantenimientoFilters>(
  "planes-mantenimiento",
)
