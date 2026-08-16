import { queryOptions } from "@tanstack/react-query"

import { activoDocumentoKeys } from "./activo-documento.keys"
import {
  getActivoDocumento,
  listActivoDocumentos,
  type ActivoDocumentoFilters,
} from "./activo-documento.service"

export const activoDocumentoQueries = {
  list: (filters?: ActivoDocumentoFilters) =>
    queryOptions({
      queryKey: activoDocumentoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listActivoDocumentos(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  byActivo: (activoId: string, filters?: Omit<ActivoDocumentoFilters, "activoId">) =>
    queryOptions({
      queryKey: activoDocumentoKeys.byActivo(activoId, filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listActivoDocumentos({
          activoId,
          ...(trimmed ? { ...rest, q: trimmed } : rest),
        })
      },
      enabled: Boolean(activoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: activoDocumentoKeys.detail(id),
      queryFn: () => getActivoDocumento(id),
      enabled: Boolean(id),
    }),
}
