import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { actividadKeys } from "./actividad.keys"
import { getActividad, listActividades } from "./actividad.service"

export const actividadQueries = {
  list: (filters?: PageParams & { search?: string }) =>
    queryOptions({
      queryKey: actividadKeys.list(filters),
      queryFn: () => {
        const { q, search, ...rest } = filters ?? {}
        const queryTerm = (q || search)?.trim()
        return listActividades(
          queryTerm ? { ...rest, q: queryTerm } : rest,
        )
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: actividadKeys.detail(id),
      queryFn: () => getActividad(id),
      enabled: Boolean(id),
    }),
}
