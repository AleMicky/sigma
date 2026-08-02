import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { tipoDatoKeys } from "./tipo-dato.keys"
import { getTipoDato, listTiposDato } from "./tipo-dato.service"

export const tipoDatoQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: tipoDatoKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listTiposDato(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: tipoDatoKeys.detail(id),
      queryFn: () => getTipoDato(id),
      enabled: Boolean(id),
    }),
}
