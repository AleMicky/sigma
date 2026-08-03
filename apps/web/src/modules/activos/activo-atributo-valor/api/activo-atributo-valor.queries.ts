import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import {
  type ActivoAtributoValorListFilters,
  activoAtributoValorKeys,
} from "./activo-atributo-valor.keys"
import {
  getActivoAtributoValor,
  listActivoAtributoValores,
} from "./activo-atributo-valor.service"

export const activoAtributoValorQueries = {
  list: (filters?: ActivoAtributoValorListFilters) =>
    queryOptions({
      queryKey: activoAtributoValorKeys.list(filters),
      queryFn: () => listActivoAtributoValores(filters),
    }),

  byActivo: (activoId: string, params?: PageParams) =>
    queryOptions({
      queryKey: activoAtributoValorKeys.list({ ...params, activoId }),
      queryFn: () =>
        listActivoAtributoValores({
          ...params,
          activoId,
          size: params?.size ?? 100,
          sortBy: params?.sortBy ?? "createdAt",
          direction: params?.direction ?? "ASC",
        }),
      enabled: Boolean(activoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: activoAtributoValorKeys.detail(id),
      queryFn: () => getActivoAtributoValor(id),
      enabled: Boolean(id),
    }),
}
