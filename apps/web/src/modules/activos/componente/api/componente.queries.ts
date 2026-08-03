import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import {
  type ComponenteListFilters,
  componenteKeys,
} from "./componente.keys"
import { getComponente, listComponentes } from "./componente.service"

export const componenteQueries = {
  list: (filters?: ComponenteListFilters) =>
    queryOptions({
      queryKey: componenteKeys.list(filters),
      queryFn: () => listComponentes(filters),
    }),

  byTipoActivo: (
    tipoActivoId: string,
    params?: PageParams & { q?: string },
  ) =>
    queryOptions({
      queryKey: componenteKeys.list({ ...params, tipoActivoId }),
      queryFn: () => {
        const q = params?.q?.trim()
        return listComponentes({
          ...params,
          tipoActivoId,
          ...(q ? { q } : {}),
        })
      },
      enabled: Boolean(tipoActivoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: componenteKeys.detail(id),
      queryFn: () => getComponente(id),
      enabled: Boolean(id),
    }),
}
