import { queryOptions } from "@tanstack/react-query"

import type { PageParams } from "@/shared/types/api.types"

import { grupoAprobadorDetalleKeys } from "./grupo-aprobador-detalle.keys"
import {
  getGrupoAprobadorDetalle,
  listGrupoAprobadorDetalles,
} from "./grupo-aprobador-detalle.service"

export const grupoAprobadorDetalleQueries = {
  list: (grupoAprobadorId: string, filters?: PageParams) =>
    queryOptions({
      queryKey: grupoAprobadorDetalleKeys.list(grupoAprobadorId, filters),
      queryFn: () => {
        const { q, ...rest } = filters ?? {}
        const trimmed = q?.trim()
        return listGrupoAprobadorDetalles(
          grupoAprobadorId,
          trimmed ? { ...rest, q: trimmed } : rest,
        )
      },
      enabled: Boolean(grupoAprobadorId),
    }),

  detail: (grupoAprobadorId: string, id: string) =>
    queryOptions({
      queryKey: grupoAprobadorDetalleKeys.detail(grupoAprobadorId, id),
      queryFn: () => getGrupoAprobadorDetalle(grupoAprobadorId, id),
      enabled: Boolean(grupoAprobadorId && id),
    }),
}
