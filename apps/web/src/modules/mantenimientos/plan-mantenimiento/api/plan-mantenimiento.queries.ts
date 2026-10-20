import { queryOptions } from "@tanstack/react-query"

import { planMantenimientoKeys, type PlanMantenimientoFilters } from "./plan-mantenimiento.keys"
import { getPlanMantenimiento, listPlanesMantenimiento } from "./plan-mantenimiento.service"

export const planMantenimientoQueries = {
  list: (filters?: PlanMantenimientoFilters) =>
    queryOptions({
      queryKey: planMantenimientoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listPlanesMantenimiento(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: planMantenimientoKeys.detail(id),
      queryFn: () => getPlanMantenimiento(id),
      enabled: Boolean(id),
    }),
}
