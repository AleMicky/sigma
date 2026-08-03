import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { tipoDocumentoKeys } from "./tipo-documento.keys"
import { getTipoDocumento, listTiposDocumento } from "./tipo-documento.service"

export const tipoDocumentoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: tipoDocumentoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listTiposDocumento(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: tipoDocumentoKeys.detail(id),
      queryFn: () => getTipoDocumento(id),
      enabled: Boolean(id),
    }),
}
