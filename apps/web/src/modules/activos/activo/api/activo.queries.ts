import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { type ActivoListFilters, activoKeys } from "./activo.keys"
import { getActivo, listActivos } from "./activo.service"

export const activoQueries = {
  list: (filters?: ActivoListFilters) =>
    queryOptions({
      queryKey: activoKeys.list(filters),
      queryFn: () => {
        const q = filters?.q?.trim()
        return listActivos(q ? { ...filters, q } : { ...filters, q: undefined })
      },
    }),

  byTipoActivo: (
    tipoActivoId: string,
    params?: PageParams & { q?: string },
  ) =>
    queryOptions({
      queryKey: activoKeys.list({ ...params, tipoActivoId }),
      queryFn: () => {
        const q = params?.q?.trim()
        return listActivos({
          ...params,
          tipoActivoId,
          ...(q ? { q } : {}),
        })
      },
      enabled: Boolean(tipoActivoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: activoKeys.detail(id),
      queryFn: () => getActivo(id),
      enabled: Boolean(id),
    }),
}
