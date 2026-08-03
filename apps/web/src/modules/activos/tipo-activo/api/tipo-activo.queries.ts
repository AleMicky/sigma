import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { tipoActivoKeys } from "./tipo-activo.keys"
import { getTipoActivo, listTiposActivo } from "./tipo-activo.service"

export const tipoActivoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: tipoActivoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listTiposActivo(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: tipoActivoKeys.detail(id),
      queryFn: () => getTipoActivo(id),
      enabled: Boolean(id),
    }),
}
