import { queryOptions } from "@tanstack/react-query"

import { conductorKeys, type ConductorListFilters } from "./conductor.keys"
import { getConductor, listConductores } from "./conductor.service"

export const conductorQueries = {
  list: (filters?: ConductorListFilters) =>
    queryOptions({
      queryKey: conductorKeys.list(filters),
      queryFn: () => {
        const { search, ...rest } = filters ?? {}
        const trimmed = search?.trim()
        return listConductores(trimmed ? { ...rest, search: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: conductorKeys.detail(id),
      queryFn: () => getConductor(id),
      enabled: Boolean(id),
    }),
}
