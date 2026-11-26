import { queryOptions } from "@tanstack/react-query"

import { normalizeDocumentoFilters } from "../lib/activo-documento.utils"
import { activoDocumentoKeys } from "./activo-documento.keys"
import {
  getActivoDocumento,
  getActivoDocumentosResumen,
  listActivoDocumentos,
  type ActivoDocumentoFilters,
  type ActivoDocumentoResumenFilters,
} from "./activo-documento.service"

export const activoDocumentoQueries = {
  list: (filters?: ActivoDocumentoFilters) => {
    const normalized = normalizeDocumentoFilters(filters)

    return queryOptions({
      queryKey: activoDocumentoKeys.list(normalized),
      queryFn: () => listActivoDocumentos(normalized),
    })
  },

  byActivo: (
    activoId: string,
    filters?: Omit<ActivoDocumentoFilters, "activoId">,
  ) => {
    const normalized = normalizeDocumentoFilters(filters)

    return queryOptions({
      queryKey: activoDocumentoKeys.byActivo(activoId, normalized),
      queryFn: () =>
        listActivoDocumentos({ activoId, ...(normalized ?? {}) }),
      enabled: Boolean(activoId),
    })
  },

  resumen: (filters?: ActivoDocumentoResumenFilters) => {
    const normalized = normalizeDocumentoFilters(filters)

    return queryOptions({
      queryKey: activoDocumentoKeys.resumen(normalized),
      queryFn: () => getActivoDocumentosResumen(normalized),
      enabled: Boolean(filters?.activoId),
    })
  },

  detail: (id: string) =>
    queryOptions({
      queryKey: activoDocumentoKeys.detail(id),
      queryFn: () => getActivoDocumento(id),
      enabled: Boolean(id),
    }),
}
