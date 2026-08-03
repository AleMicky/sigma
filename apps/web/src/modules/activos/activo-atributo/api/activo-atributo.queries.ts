import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import {
  type ActivoAtributoListFilters,
  activoAtributoKeys,
} from "./activo-atributo.keys"
import {
  getActivoAtributo,
  listActivoAtributos,
} from "./activo-atributo.service"

export const activoAtributoQueries = {
  list: (filters?: ActivoAtributoListFilters) =>
    queryOptions({
      queryKey: activoAtributoKeys.list(filters),
      queryFn: () => listActivoAtributos(filters),
    }),

  byTipoActivo: (
    tipoActivoId: string,
    params?: PageParams & { q?: string },
  ) =>
    queryOptions({
      queryKey: activoAtributoKeys.list({ ...params, tipoActivoId }),
      queryFn: () => {
        const q = params?.q?.trim()
        return listActivoAtributos({
          ...params,
          tipoActivoId,
          ...(q ? { q } : {}),
        })
      },
      enabled: Boolean(tipoActivoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: activoAtributoKeys.detail(id),
      queryFn: () => getActivoAtributo(id),
      enabled: Boolean(id),
    }),
}
