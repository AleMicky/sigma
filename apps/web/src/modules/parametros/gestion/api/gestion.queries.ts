import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { gestionKeys } from "./gestion.keys"
import { getGestion, listGestiones } from "./gestion.service"

export const gestionQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: gestionKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listGestiones(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: gestionKeys.detail(id),
      queryFn: () => getGestion(id),
      enabled: Boolean(id),
    }),
}
