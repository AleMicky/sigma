import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { actividadKeys } from "./actividad.keys"
import { getActividad, listActividades } from "./actividad.service"

export const actividadQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: actividadKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listActividades(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: actividadKeys.detail(id),
      queryFn: () => getActividad(id),
      enabled: Boolean(id),
    }),
}
