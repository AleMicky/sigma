import { queryOptions } from "@tanstack/react-query"

import { tipoInsumoAtributoKeys } from "./tipo-insumo-atributo.keys"
import {
  getTipoInsumoAtributo,
  listTiposInsumoAtributo,
  type TipoInsumoAtributoFilters,
} from "./tipo-insumo-atributo.service"

export const tipoInsumoAtributoQueries = {
  list: (filters?: TipoInsumoAtributoFilters) =>
    queryOptions({
      queryKey: tipoInsumoAtributoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listTiposInsumoAtributo(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: tipoInsumoAtributoKeys.detail(id),
      queryFn: () => getTipoInsumoAtributo(id),
      enabled: Boolean(id),
    }),
}
