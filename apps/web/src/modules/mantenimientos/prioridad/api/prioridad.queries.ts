import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { prioridadKeys } from "./prioridad.keys"
import { getPrioridad, listPrioridades } from "./prioridad.service"

export const prioridadQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: prioridadKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listPrioridades(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: prioridadKeys.detail(id),
      queryFn: () => getPrioridad(id),
      enabled: Boolean(id),
    }),
}
