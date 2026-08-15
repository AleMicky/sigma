import { queryOptions } from "@tanstack/react-query"

import { insumoAtributoValorKeys } from "./insumo-atributo-valor.keys"
import {
  getInsumoAtributoValor,
  listInsumosAtributoValor,
  type InsumoAtributoValorFilters,
} from "./insumo-atributo-valor.service"

export const insumoAtributoValorQueries = {
  list: (filters?: InsumoAtributoValorFilters) =>
    queryOptions({
      queryKey: insumoAtributoValorKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listInsumosAtributoValor(trimmed ? { ...rest, q: trimmed } : rest)
      },
      enabled: filters?.insumoId !== undefined ? Boolean(filters.insumoId) : true,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: insumoAtributoValorKeys.detail(id),
      queryFn: () => getInsumoAtributoValor(id),
      enabled: Boolean(id),
    }),
}
