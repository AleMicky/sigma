import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { usuarioKeys } from "./usuario.keys"
import { getUsuario, listUsuarios } from "./usuario.service"

export const usuarioQueries = {
  list: (filters?: PageParams) =>
    queryOptions({
      queryKey: usuarioKeys.list(filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listUsuarios(trimmed ? { ...rest, q: trimmed } : rest)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: usuarioKeys.detail(id),
      queryFn: () => getUsuario(id),
      enabled: Boolean(id),
    }),
}
