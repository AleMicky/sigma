import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { tipoMantenimientoKeys } from "./tipo-mantenimiento.keys"
import { getTipoMantenimiento, listTiposMantenimiento } from "./tipo-mantenimiento.service"

export const tipoMantenimientoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: tipoMantenimientoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listTiposMantenimiento(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: tipoMantenimientoKeys.detail(id),
      queryFn: () => getTipoMantenimiento(id),
      enabled: Boolean(id),
    }),
}
