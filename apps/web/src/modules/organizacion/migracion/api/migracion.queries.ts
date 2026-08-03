import { queryOptions } from "@tanstack/react-query"

import type { MigracionFilters } from "./migracion.service"
import { migracionKeys } from "./migracion.keys"
import { getRegistroMigracion, listRegistrosMigracion } from "./migracion.service"

export const migracionQueries = {
  list: (filters?: MigracionFilters, refetchInterval?: number | false) =>
    queryOptions({
      queryKey: migracionKeys.list(filters),
      queryFn: () => {
        const {
          q,
          sistemaOrigen,
          entidad,
          estado,
          fechaDesde,
          fechaHasta,
          ...rest
        } = filters ?? {}
        const cleanParams: MigracionFilters = { ...rest }

        if (q?.trim()) cleanParams.q = q.trim()
        if (sistemaOrigen?.trim()) cleanParams.sistemaOrigen = sistemaOrigen.trim()
        if (entidad?.trim()) cleanParams.entidad = entidad.trim()
        if (estado && estado !== "TODOS") cleanParams.estado = estado
        if (fechaDesde) cleanParams.fechaDesde = fechaDesde
        if (fechaHasta) cleanParams.fechaHasta = fechaHasta

        return listRegistrosMigracion(cleanParams)
      },
      refetchInterval: refetchInterval ?? false,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: migracionKeys.detail(id),
      queryFn: () => getRegistroMigracion(id),
      enabled: Boolean(id),
    }),
}
