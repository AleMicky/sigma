import { queryOptions } from "@tanstack/react-query"

import { porteriaKeys } from "./porteria.keys"
import {
  getRegistroPorteriaById,
  listRegistrosAfuera,
  listRegistrosPorteria,
} from "./porteria.service"
import type { PorteriaFiltros } from "./porteria.types"

export const porteriaQueries = {
  list: (filters?: PorteriaFiltros) =>
    queryOptions({
      queryKey: porteriaKeys.list(filters),
      queryFn: () => listRegistrosPorteria(filters),
    }),

  afuera: () =>
    queryOptions({
      queryKey: porteriaKeys.afuera(),
      queryFn: () => listRegistrosAfuera(),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: porteriaKeys.detail(id),
      queryFn: () => getRegistroPorteriaById(id),
      enabled: Boolean(id),
    }),
}

