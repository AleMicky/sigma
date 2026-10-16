import { queryOptions } from "@tanstack/react-query"

import { tipoActivoEstadoKeys } from "./tipo-activo-estado.keys"
import {
  getTipoActivoEstado,
  listTiposActivoEstados,
  type TipoActivoEstadoFilters,
} from "./tipo-activo-estado.service"

export const tipoActivoEstadoQueries = {
  list: (filters?: TipoActivoEstadoFilters) =>
    queryOptions({
      queryKey: tipoActivoEstadoKeys.list(filters),
      queryFn: () => listTiposActivoEstados(filters),
    }),

  byTipoActivoId: (tipoActivoId: string) =>
    queryOptions({
      queryKey: tipoActivoEstadoKeys.list({ tipoActivoId }),
      queryFn: () => listTiposActivoEstados({ tipoActivoId, size: 100 }),
      enabled: Boolean(tipoActivoId),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: tipoActivoEstadoKeys.detail(id),
      queryFn: () => getTipoActivoEstado(id),
      enabled: Boolean(id),
    }),
}
