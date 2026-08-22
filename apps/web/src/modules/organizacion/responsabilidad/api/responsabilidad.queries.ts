import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { responsabilidadKeys } from "./responsabilidad.keys"
import {
  getResponsabilidad,
  listResponsabilidades,
} from "./responsabilidad.service"

export const responsabilidadQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: responsabilidadKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listResponsabilidades(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: responsabilidadKeys.detail(id),
      queryFn: () => getResponsabilidad(id),
      enabled: Boolean(id),
    }),
}
