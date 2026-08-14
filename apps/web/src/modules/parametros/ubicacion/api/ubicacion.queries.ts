import { queryOptions } from "@tanstack/react-query"

import { ubicacionKeys, type UbicacionFilters } from "./ubicacion.keys"
import {
  getUbicacion,
  getUbicacionesArbol,
  getUbicacionesRaices,
  getUbicacionHijos,
  getUbicacionSubArbol,
  listUbicaciones,
} from "./ubicacion.service"

export const ubicacionQueries = {
  list: (filters?: UbicacionFilters) =>
    queryOptions({
      queryKey: ubicacionKeys.list(filters),
      queryFn: () => {
        const { q, tipo, ...rest } = filters ?? {}
        const params: Record<string, unknown> = { ...rest }
        if (q?.trim()) params.q = q.trim()
        if (tipo) params.tipo = tipo
        return listUbicaciones(params as UbicacionFilters)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ubicacionKeys.detail(id),
      queryFn: () => getUbicacion(id),
      enabled: Boolean(id),
    }),

  raices: () =>
    queryOptions({
      queryKey: ubicacionKeys.raices(),
      queryFn: () => getUbicacionesRaices(),
    }),

  arbol: () =>
    queryOptions({
      queryKey: ubicacionKeys.arbol(),
      queryFn: () => getUbicacionesArbol(),
    }),

  hijos: (id: string) =>
    queryOptions({
      queryKey: ubicacionKeys.hijos(id),
      queryFn: () => getUbicacionHijos(id),
      enabled: Boolean(id),
    }),

  subArbol: (id: string) =>
    queryOptions({
      queryKey: ubicacionKeys.subArbol(id),
      queryFn: () => getUbicacionSubArbol(id),
      enabled: Boolean(id),
    }),
}
