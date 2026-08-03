import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { personaKeys } from "./persona.keys"
import { getPersona, listPersonas } from "./persona.service"

export const personaQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: personaKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listPersonas(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: personaKeys.detail(id),
      queryFn: () => getPersona(id),
      enabled: Boolean(id),
    }),
}
